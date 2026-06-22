const express = require('express');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'vehicle_data.db');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── DATABASE SETUP ───────────────────────────────────────
let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vehicle_types (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      license_plate   TEXT NOT NULL UNIQUE,
      name            TEXT NOT NULL,
      department_id   INTEGER NOT NULL,
      vehicle_type_id INTEGER NOT NULL,
      brand           TEXT,
      model           TEXT,
      year            INTEGER,
      fuel_type       TEXT DEFAULT 'gasoline',
      is_active       INTEGER DEFAULT 1,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id)   REFERENCES departments(id),
      FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
    );
    CREATE TABLE IF NOT EXISTS expense_categories (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL UNIQUE,
      name_en TEXT,
      icon    TEXT DEFAULT '💰',
      color   TEXT DEFAULT '#6c757d'
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id           INTEGER NOT NULL,
      category_id          INTEGER NOT NULL,
      expense_date         DATE NOT NULL,
      amount               REAL NOT NULL,
      distance_km          REAL,
      fuel_liters          REAL,
      fuel_price_per_liter REAL,
      odometer             INTEGER,
      description          TEXT,
      receipt_no           TEXT,
      created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id)   REFERENCES vehicles(id),
      FOREIGN KEY (category_id)  REFERENCES expense_categories(id)
    );
  `);

  // Seed defaults
  const cats = [
    ['ค่าน้ำมัน','fuel','⛽','#e67e22'],
    ['ค่าเซอร์วิสตามระยะ','periodic_service','🔧','#3498db'],
    ['ค่าซ่อม','repair','🔨','#e74c3c'],
    ['ค่าเปลี่ยนยาง','tire','🛞','#2ecc71'],
    ['ประกันภัย','insurance','🛡️','#9b59b6'],
    ['ค่าทางด่วน/ค่าผ่านทาง','toll','🛣️','#1abc9c'],
    ['ค่าจอดรถ','parking','🅿️','#34495e'],
    ['พ.ร.บ. / ภาษีรถ','tax','📋','#f39c12'],
    ['ค่าใช้จ่ายอื่นๆ','other','📝','#95a5a6'],
  ];
  cats.forEach(([name,name_en,icon,color]) =>
    db.run(`INSERT OR IGNORE INTO expense_categories (name,name_en,icon,color) VALUES (?,?,?,?)`,
      [name,name_en,icon,color])
  );

  const vtypes = [
    ['รถยนต์ส่วนบุคคล','Passenger Car'],
    ['รถกระบะ','Pickup Truck'],
    ['รถตู้','Van'],
    ['รถบรรทุก','Truck'],
    ['รถจักรยานยนต์','Motorcycle'],
    ['รถพ่วง','Trailer'],
  ];
  vtypes.forEach(([name,desc]) =>
    db.run(`INSERT OR IGNORE INTO vehicle_types (name,description) VALUES (?,?)`, [name,desc])
  );

  saveDb();
  console.log('✅ Database ready:', DB_PATH);
}

// ─── sql.js HELPERS ───────────────────────────────────────
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryGet(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  const lastId = queryGet('SELECT last_insert_rowid() as id');
  saveDb();
  return { lastInsertRowid: lastId?.id };
}

// ─── DEPARTMENTS ──────────────────────────────────────────
app.get('/api/departments', (req, res) => {
  res.json(queryAll('SELECT * FROM departments ORDER BY name'));
});

app.post('/api/departments', (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const r = run('INSERT INTO departments (name,code) VALUES (?,?)', [name, code||null]);
    res.json({ id: r.lastInsertRowid, name, code });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/departments/:id', (req, res) => {
  const { name, code } = req.body;
  run('UPDATE departments SET name=?,code=? WHERE id=?', [name, code, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/departments/:id', (req, res) => {
  const used = queryGet('SELECT COUNT(*) as cnt FROM vehicles WHERE department_id=?', [req.params.id]);
  if (used?.cnt > 0) return res.status(400).json({ error: 'มีรถอยู่ในหน่วยงานนี้' });
  run('DELETE FROM departments WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// ─── VEHICLE TYPES ─────────────────────────────────────────
app.get('/api/vehicle-types', (req, res) => {
  res.json(queryAll('SELECT * FROM vehicle_types ORDER BY name'));
});

app.post('/api/vehicle-types', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const r = run('INSERT INTO vehicle_types (name,description) VALUES (?,?)', [name, description||null]);
    res.json({ id: r.lastInsertRowid, name, description });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/vehicle-types/:id', (req, res) => {
  const { name, description } = req.body;
  run('UPDATE vehicle_types SET name=?,description=? WHERE id=?', [name, description, req.params.id]);
  res.json({ success: true });
});

// ─── VEHICLES ──────────────────────────────────────────────
app.get('/api/vehicles', (req, res) => {
  res.json(queryAll(`
    SELECT v.*, d.name as department_name, vt.name as vehicle_type_name
    FROM vehicles v
    JOIN departments d  ON v.department_id   = d.id
    JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
    WHERE v.is_active = 1 ORDER BY d.name, v.name
  `));
});

app.post('/api/vehicles', (req, res) => {
  const { license_plate, name, department_id, vehicle_type_id, brand, model, year, fuel_type } = req.body;
  if (!license_plate || !name || !department_id || !vehicle_type_id)
    return res.status(400).json({ error: 'Required fields missing' });
  try {
    const r = run(
      `INSERT INTO vehicles (license_plate,name,department_id,vehicle_type_id,brand,model,year,fuel_type)
       VALUES (?,?,?,?,?,?,?,?)`,
      [license_plate, name, department_id, vehicle_type_id, brand||null, model||null, year||null, fuel_type||'gasoline']
    );
    res.json({ id: r.lastInsertRowid, ...req.body });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/vehicles/:id', (req, res) => {
  const { license_plate, name, department_id, vehicle_type_id, brand, model, year, fuel_type, is_active } = req.body;
  run(
    `UPDATE vehicles SET license_plate=?,name=?,department_id=?,vehicle_type_id=?,
     brand=?,model=?,year=?,fuel_type=?,is_active=? WHERE id=?`,
    [license_plate, name, department_id, vehicle_type_id, brand||null, model||null, year||null, fuel_type, is_active??1, req.params.id]
  );
  res.json({ success: true });
});

app.delete('/api/vehicles/:id', (req, res) => {
  run('UPDATE vehicles SET is_active=0 WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// ─── EXPENSE CATEGORIES ────────────────────────────────────
app.get('/api/expense-categories', (req, res) => {
  res.json(queryAll('SELECT * FROM expense_categories ORDER BY id'));
});

// ─── EXPENSES ──────────────────────────────────────────────
app.get('/api/expenses', (req, res) => {
  const { vehicle_id, department_id, vehicle_type_id, category_id, date_from, date_to } = req.query;
  const limit = parseInt(req.query.limit) || 100;
  let sql = `
    SELECT e.*, v.name as vehicle_name, v.license_plate,
           d.name as department_name, vt.name as vehicle_type_name,
           ec.name as category_name, ec.icon as category_icon, ec.color as category_color
    FROM expenses e
    JOIN vehicles v            ON e.vehicle_id  = v.id
    JOIN departments d         ON v.department_id  = d.id
    JOIN vehicle_types vt      ON v.vehicle_type_id = vt.id
    JOIN expense_categories ec ON e.category_id = ec.id
    WHERE 1=1`;
  const params = [];
  if (vehicle_id)      { sql += ' AND e.vehicle_id=?';       params.push(+vehicle_id); }
  if (department_id)   { sql += ' AND v.department_id=?';    params.push(+department_id); }
  if (vehicle_type_id) { sql += ' AND v.vehicle_type_id=?';  params.push(+vehicle_type_id); }
  if (category_id)     { sql += ' AND e.category_id=?';      params.push(+category_id); }
  if (date_from)       { sql += ' AND e.expense_date>=?';    params.push(date_from); }
  if (date_to)         { sql += ' AND e.expense_date<=?';    params.push(date_to); }
  sql += ' ORDER BY e.expense_date DESC, e.id DESC LIMIT ?';
  params.push(limit);
  res.json(queryAll(sql, params));
});

app.post('/api/expenses', (req, res) => {
  const { vehicle_id, category_id, expense_date, amount, distance_km,
          fuel_liters, fuel_price_per_liter, odometer, description, receipt_no } = req.body;
  if (!vehicle_id || !category_id || !expense_date || !amount)
    return res.status(400).json({ error: 'Required fields missing' });
  try {
    const r = run(
      `INSERT INTO expenses (vehicle_id,category_id,expense_date,amount,distance_km,
       fuel_liters,fuel_price_per_liter,odometer,description,receipt_no)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [+vehicle_id, +category_id, expense_date, +amount,
       distance_km||null, fuel_liters||null, fuel_price_per_liter||null,
       odometer||null, description||null, receipt_no||null]
    );
    res.json({ id: r.lastInsertRowid, ...req.body });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/expenses/:id', (req, res) => {
  const { vehicle_id, category_id, expense_date, amount, distance_km,
          fuel_liters, fuel_price_per_liter, odometer, description, receipt_no } = req.body;
  run(
    `UPDATE expenses SET vehicle_id=?,category_id=?,expense_date=?,amount=?,distance_km=?,
     fuel_liters=?,fuel_price_per_liter=?,odometer=?,description=?,receipt_no=? WHERE id=?`,
    [+vehicle_id, +category_id, expense_date, +amount,
     distance_km||null, fuel_liters||null, fuel_price_per_liter||null,
     odometer||null, description||null, receipt_no||null, req.params.id]
  );
  res.json({ success: true });
});

app.delete('/api/expenses/:id', (req, res) => {
  run('DELETE FROM expenses WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// ─── DASHBOARD ─────────────────────────────────────────────
app.get('/api/dashboard/summary', (req, res) => {
  const { date_from, date_to, department_id, vehicle_type_id } = req.query;
  let where = 'WHERE 1=1';
  const p = [];
  if (date_from)       { where += ' AND e.expense_date>=?';   p.push(date_from); }
  if (date_to)         { where += ' AND e.expense_date<=?';   p.push(date_to); }
  if (department_id)   { where += ' AND v.department_id=?';   p.push(+department_id); }
  if (vehicle_type_id) { where += ' AND v.vehicle_type_id=?'; p.push(+vehicle_type_id); }

  const base = `FROM expenses e JOIN vehicles v ON e.vehicle_id=v.id`;

  const summary = queryGet(
    `SELECT COALESCE(SUM(e.amount),0) as total,
            COUNT(DISTINCT e.vehicle_id) as vehicles,
            COALESCE(SUM(e.distance_km),0) as total_km,
            COUNT(e.id) as transactions
     ${base} ${where}`, p);

  const byCategory = queryAll(
    `SELECT ec.name,ec.icon,ec.color,
            COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count
     ${base} JOIN expense_categories ec ON e.category_id=ec.id
     ${where} GROUP BY ec.id ORDER BY total DESC`, p);

  const byDept = queryAll(
    `SELECT d.name as department,
            COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count
     ${base} JOIN departments d ON v.department_id=d.id
     ${where} GROUP BY d.id ORDER BY total DESC`, p);

  const byType = queryAll(
    `SELECT vt.name as vehicle_type,
            COALESCE(SUM(e.amount),0) as total, COUNT(e.id) as count
     ${base} JOIN vehicle_types vt ON v.vehicle_type_id=vt.id
     ${where} GROUP BY vt.id ORDER BY total DESC`, p);

  const byMonth = queryAll(
    `SELECT substr(e.expense_date,1,7) as month,
            COALESCE(SUM(e.amount),0) as total
     ${base} ${where} GROUP BY month ORDER BY month DESC LIMIT 12`, p);

  const byVehicle = queryAll(
    `SELECT v.name,v.license_plate, d.name as department,
            COALESCE(SUM(e.amount),0) as total,
            COALESCE(SUM(e.distance_km),0) as km
     ${base} JOIN departments d ON v.department_id=d.id
     ${where} GROUP BY v.id ORDER BY total DESC LIMIT 10`, p);

  const recent = queryAll(
    `SELECT e.*,v.name as vehicle_name,v.license_plate,d.name as department_name,
            ec.name as category_name,ec.icon as category_icon,ec.color as category_color
     ${base} JOIN departments d ON v.department_id=d.id
     JOIN expense_categories ec ON e.category_id=ec.id
     ${where} ORDER BY e.expense_date DESC, e.id DESC LIMIT 10`, p);

  res.json({
    summary, byCategory, byDept, byType,
    byMonth: [...byMonth].reverse(),
    byVehicle, recent,
  });
});

// ─── EXPORT ────────────────────────────────────────────────
app.get('/api/export', (req, res) => {
  const data = {
    exported_at:   new Date().toISOString(),

    departments:   queryAll('SELECT * FROM departments'),
    vehicle_types: queryAll('SELECT * FROM vehicle_types'),
    vehicles:      queryAll('SELECT * FROM vehicles'),
    expenses:      queryAll('SELECT * FROM expenses ORDER BY expense_date'),
  };
  const date = new Date().toISOString().slice(0,10);
  res.setHeader('Content-Disposition', `attachment; filename="vehicle_export_${date}.json"`);
  res.json(data);
});

// FRONTEND
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// START
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n Vehicle Expense System');
    console.log('   PC:     http://localhost:' + PORT);
    console.log('   Mobile: http://<your-ip>:' + PORT + '\n');
  });
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
