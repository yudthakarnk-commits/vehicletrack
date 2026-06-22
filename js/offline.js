// ============================================================
//  Offline Storage & Sync (IndexedDB via native API)
// ============================================================

const DB_NAME    = 'VehicleExpenseDB';
const DB_VERSION = 1;

let idb = null;

// Open IndexedDB
function openIDB() {
  return new Promise((resolve, reject) => {
    if (idb) return resolve(idb);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      // Cache stores (mirror of Supabase tables)
      ['departments','vehicle_types','expense_categories','vehicles','user_profiles','user_vehicles']
        .forEach(name => {
          if (!db.objectStoreNames.contains(name))
            db.createObjectStore(name, { keyPath: 'id' });
        });
      // Expenses with date index
      if (!db.objectStoreNames.contains('expenses')) {
        const es = db.createObjectStore('expenses', { keyPath: 'id' });
        es.createIndex('by_date', 'expense_date');
        es.createIndex('by_vehicle', 'vehicle_id');
        es.createIndex('by_client_id', 'client_id', { unique: true });
      }
      // Pending sync queue
      if (!db.objectStoreNames.contains('pending_sync')) {
        const ps = db.createObjectStore('pending_sync', { keyPath: 'client_id', autoIncrement: false });
        ps.createIndex('by_created', 'created_at');
      }
      // Access logs cache
      if (!db.objectStoreNames.contains('access_logs')) {
        const al = db.createObjectStore('access_logs', { keyPath: 'id', autoIncrement: true });
        al.createIndex('by_created', 'created_at');
      }
    };
    req.onsuccess  = e => { idb = e.target.result; resolve(idb); };
    req.onerror    = e => reject(e.target.error);
  });
}

// Generic IDB helpers
function idbGetAll(storeName) {
  return openIDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  }));
}

function idbPut(storeName, record) {
  return openIDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => res();
    tx.onerror    = e => rej(e.target.error);
  }));
}

function idbPutMany(storeName, records) {
  return openIDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    records.forEach(r => store.put(r));
    tx.oncomplete = () => res();
    tx.onerror    = e => rej(e.target.error);
  }));
}

function idbDelete(storeName, key) {
  return openIDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => res();
    tx.onerror    = e => rej(e.target.error);
  }));
}

function idbClear(storeName) {
  return openIDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => res();
    tx.onerror    = e => rej(e.target.error);
  }));
}

// ─── SYNC QUEUE ────────────────────────────────────────────
// Add operation to pending sync queue
async function queueSync(operation, tableName, data) {
  const clientId = data.client_id || crypto.randomUUID();
  await idbPut('pending_sync', {
    client_id:  clientId,
    operation,
    table_name: tableName,
    data:       { ...data, client_id: clientId },
    created_at: new Date().toISOString(),
  });
  return clientId;
}

// Get all pending operations
async function getPendingSync() {
  return idbGetAll('pending_sync');
}

// Remove synced operation
async function removeSynced(clientId) {
  return idbDelete('pending_sync', clientId);
}

// ─── SYNC ENGINE ───────────────────────────────────────────
let isSyncing = false;

async function syncToServer(supabase) {
  if (isSyncing || !navigator.onLine) return;
  const pending = await getPendingSync();
  if (pending.length === 0) return;

  isSyncing = true;
  updateSyncStatus('syncing');

  let synced = 0, failed = 0;
  for (const item of pending) {
    try {
      if (item.table_name === 'expenses') {
        if (item.operation === 'INSERT') {
          const { error } = await supabase
            .from('expenses')
            .upsert(item.data, { onConflict: 'client_id', ignoreDuplicates: false });
          if (error) throw error;
        } else if (item.operation === 'UPDATE') {
          const { error } = await supabase
            .from('expenses')
            .update(item.data)
            .eq('client_id', item.client_id);
          if (error) throw error;
        } else if (item.operation === 'DELETE') {
          const { error } = await supabase
            .from('expenses')
            .update({ is_deleted: true })
            .eq('client_id', item.client_id);
          if (error) throw error;
        }
      }
      await removeSynced(item.client_id);
      synced++;
    } catch(e) {
      console.warn('Sync failed for', item.client_id, e.message);
      failed++;
    }
  }

  isSyncing = false;
  const msg = failed > 0
    ? `ซิงค์แล้ว ${synced}/${synced+failed} รายการ ⚠️`
    : `${t('sync_done')} (${synced} รายการ)`;
  updateSyncStatus(failed > 0 ? 'warning' : 'done', msg);
  return { synced, failed };
}

// Pull fresh data from server into IDB cache
async function pullFromServer(supabase) {
  if (!navigator.onLine) return;
  try {
    const [depts, vtypes, cats, vehicles] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('vehicle_types').select('*'),
      supabase.from('expense_categories').select('*'),
      supabase.from('vehicles').select('*, departments(name), vehicle_types(name)').eq('is_active', true),
    ]);
    if (depts.data)   await idbPutMany('departments', depts.data);
    if (vtypes.data)  await idbPutMany('vehicle_types', vtypes.data);
    if (cats.data)    await idbPutMany('expense_categories', cats.data);
    if (vehicles.data) {
      const mapped = vehicles.data.map(v => ({
        ...v,
        department_name:   v.departments?.name,
        vehicle_type_name: v.vehicle_types?.name,
      }));
      await idbPutMany('vehicles', mapped);
    }
  } catch(e) {
    console.warn('Pull from server failed:', e.message);
  }
}

// Status indicator
function updateSyncStatus(status, msg) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  const icons = { syncing:'🔄', done:'✅', warning:'⚠️', offline:'📴', online:'🟢' };
  el.textContent = (icons[status] || '') + ' ' + (msg || t(status === 'syncing' ? 'syncing' : status === 'done' ? 'sync_done' : status));
  el.className = 'sync-badge sync-' + status;
}

// Listen for online/offline events
function initNetworkListeners(supabase, onOnline) {
  window.addEventListener('online', async () => {
    updateSyncStatus('online', t('online'));
    await syncToServer(supabase);
    await pullFromServer(supabase);
    if (onOnline) onOnline();
  });
  window.addEventListener('offline', () => {
    updateSyncStatus('offline');
  });
  // Set initial status
  if (navigator.onLine) updateSyncStatus('online', t('online'));
  else updateSyncStatus('offline');
}

// Count pending items
async function getPendingCount() {
  const items = await getPendingSync();
  return items.length;
}
