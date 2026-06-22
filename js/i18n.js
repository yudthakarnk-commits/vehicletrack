// ============================================================
//  i18n — Thai / English translations
// ============================================================
const TRANSLATIONS = {
  th: {
    // Nav
    nav_dashboard:    'แดชบอร์ด',
    nav_add_expense:  'บันทึกค่าใช้จ่าย',
    nav_expenses:     'รายการค่าใช้จ่าย',
    nav_vehicles:     'จัดการรถ',
    nav_report:       'รายงาน',
    nav_users:        'จัดการผู้ใช้',
    nav_access_logs:  'ประวัติการใช้งาน',
    nav_settings:     'ตั้งค่า',

    // Auth
    login_title:      'เข้าสู่ระบบ',
    email:            'อีเมล',
    password:         'รหัสผ่าน',
    btn_login:        'เข้าสู่ระบบ',
    btn_logout:       'ออกจากระบบ',
    login_error:      'อีเมลหรือรหัสผ่านไม่ถูกต้อง',

    // Dashboard
    total_expense:    'ค่าใช้จ่ายรวม',
    total_vehicles:   'จำนวนรถ',
    total_km:         'ระยะทางรวม',
    fuel_cost:        'ค่าน้ำมัน',
    transactions:     'รายการ',
    km_unit:          'กิโลเมตร',
    cars_unit:        'คัน',
    monthly_expense:  'ค่าใช้จ่ายรายเดือน',
    by_category:      'สัดส่วนตามประเภท',
    by_dept:          'ค่าใช้จ่ายตามหน่วยงาน',
    top_vehicles:     'รถที่มีค่าใช้จ่ายสูงสุด',
    recent:           'รายการล่าสุด',
    view_all:         'ดูทั้งหมด',

    // Filters
    period:           'ช่วงเวลา',
    this_month:       'เดือนนี้',
    last_month:       'เดือนที่แล้ว',
    this_year:        'ปีนี้',
    last_7:           '7 วันล่าสุด',
    last_30:          '30 วันล่าสุด',
    custom:           'กำหนดเอง',
    department:       'หน่วยงาน',
    all:              'ทั้งหมด',
    vehicle_type:     'ชนิดรถ',
    show_data:        'แสดงข้อมูล',
    from_date:        'จากวันที่',
    to_date:          'ถึงวันที่',

    // Expense Form
    add_expense:      'บันทึกค่าใช้จ่าย',
    date:             'วันที่',
    vehicle:          'รถ',
    expense_type:     'ประเภทค่าใช้จ่าย',
    amount:           'จำนวนเงิน (RM)',
    fuel_liters:      'ปริมาณน้ำมัน (ลิตร)',
    price_per_liter:  'ราคาต่อลิตร (RM)',
    distance:         'ระยะทาง (กม.)',
    odometer:         'เลขไมล์ (กม.)',
    receipt_no:       'เลขที่ใบเสร็จ',
    notes:            'หมายเหตุ',
    btn_save:         'บันทึกข้อมูล',
    btn_reset:        'รีเซ็ต',
    save_success:     'บันทึกสำเร็จ ✅',
    save_offline:     'บันทึกในเครื่อง (รอซิงค์) 📴',
    save_error:       'เกิดข้อผิดพลาด',
    select_dept:      '-- เลือกหน่วยงาน --',
    select_vehicle:   '-- เลือกรถ --',
    select_type:      '-- เลือกประเภท --',

    // Expenses List
    expense_list:     'รายการค่าใช้จ่าย',
    col_date:         'วันที่',
    col_dept:         'หน่วยงาน',
    col_vehicle:      'รถ',
    col_vtype:        'ชนิดรถ',
    col_category:     'ประเภท',
    col_distance:     'ระยะทาง',
    col_amount:       'จำนวนเงิน',
    col_notes:        'หมายเหตุ',
    col_actions:      'จัดการ',
    total_label:      'รวม:',
    no_data:          'ไม่พบข้อมูล',
    confirm_delete:   'ยืนยันการลบรายการนี้?',
    delete_success:   'ลบรายการสำเร็จ',

    // Vehicles
    vehicle_list:     'รายการรถ',
    add_vehicle:      'เพิ่มรถ',
    col_plate:        'ทะเบียน',
    col_name:         'ชื่อรถ',
    col_brand:        'ยี่ห้อ/รุ่น',
    col_brand_only:   'ยี่ห้อ',
    col_model:        'รุ่น',
    col_year:         'ปี',
    col_fuel:         'เชื้อเพลิง',
    no_vehicles:      'ยังไม่มีรถ',
    confirm_del_veh:  'ยืนยันการลบรถคันนี้?',

    // Report
    report_title:     'รายงาน',
    group_by:         'แสดงตาม',
    group_category:   'ประเภทค่าใช้จ่าย',
    group_dept:       'หน่วยงาน',
    group_vtype:      'ชนิดรถ',
    group_vehicle:    'รถ',
    group_month:      'รายเดือน',
    btn_report:       'สร้างรายงาน',
    btn_print:        'พิมพ์',
    col_item:         'รายการ',
    col_total:        'จำนวนเงิน',
    col_pct:          'สัดส่วน',
    col_count:        'รายการ',
    col_km:           'ระยะทาง',
    grand_total:      'รวมทั้งหมด',

    // Users
    user_management:  'จัดการผู้ใช้',
    add_user:         'เพิ่มผู้ใช้',
    col_email:        'อีเมล',
    col_fullname:     'ชื่อ-นามสกุล',
    col_role:         'สิทธิ์',
    col_vehicles:     'รถที่รับผิดชอบ',
    role_admin:       'ผู้ดูแลระบบ',
    role_manager:     'ผู้จัดการ',
    role_user:        'ผู้ใช้งาน',

    // Access Logs
    access_logs:      'ประวัติการใช้งาน',
    col_user:         'ผู้ใช้',
    col_action:       'การกระทำ',
    col_details:      'รายละเอียด',
    col_time:         'เวลา',

    // Settings
    settings:         'ตั้งค่า',
    dept_mgmt:        'หน่วยงาน',
    vtype_mgmt:       'ชนิดรถ',
    btn_add:          'เพิ่ม',
    btn_edit:         'แก้ไข',
    btn_delete:       'ลบ',
    btn_cancel:       'ยกเลิก',
    btn_confirm:      'ยืนยัน',
    col_desc:         'คำอธิบาย',
    col_code:         'รหัส',

    // Fuel form
    fuel_grade:       'ชนิดน้ำมัน',
    select_grade:     '-- เลือกชนิด --',

    // Camera / Receipt
    scan_receipt:     'สแกนใบเสร็จ',
    scanning:         'กำลังสแกน...',
    scan_result:      'ผลการสแกน',
    scan_confirm:     'ใช้ยอดนี้',
    scan_error:       'สแกนไม่สำเร็จ กรอกมือ',
    currency:         'RM',

    // Status
    online:           'ออนไลน์',
    offline:          'ออฟไลน์',
    syncing:          'กำลังซิงค์...',
    sync_done:        'ซิงค์สำเร็จ',
    pending_sync:     'รอซิงค์',
    export:           'ส่งออกข้อมูล',

    // Fuel types
    fuel_gasoline:    'เบนซิน',
    fuel_diesel:      'ดีเซล',
    fuel_ev:          'ไฟฟ้า',
    fuel_hybrid:      'ไฮบริด',
    fuel_lpg:         'LPG',
    fuel_ngv:         'NGV',
  },
  en: {
    nav_dashboard:    'Dashboard',
    nav_add_expense:  'Add Expense',
    nav_expenses:     'Expense List',
    nav_vehicles:     'Vehicles',
    nav_report:       'Reports',
    nav_users:        'User Management',
    nav_access_logs:  'Access Logs',
    nav_settings:     'Settings',

    login_title:      'Sign In',
    email:            'Email',
    password:         'Password',
    btn_login:        'Sign In',
    btn_logout:       'Sign Out',
    login_error:      'Invalid email or password',

    total_expense:    'Total Expense',
    total_vehicles:   'Vehicles',
    total_km:         'Total Distance',
    fuel_cost:        'Fuel Cost',
    transactions:     'transactions',
    km_unit:          'km',
    cars_unit:        'cars',
    monthly_expense:  'Monthly Expenses',
    by_category:      'By Category',
    by_dept:          'By Department',
    top_vehicles:     'Top Vehicles by Cost',
    recent:           'Recent Transactions',
    view_all:         'View All',

    period:           'Period',
    this_month:       'This Month',
    last_month:       'Last Month',
    this_year:        'This Year',
    last_7:           'Last 7 Days',
    last_30:          'Last 30 Days',
    custom:           'Custom',
    department:       'Department',
    all:              'All',
    vehicle_type:     'Vehicle Type',
    show_data:        'Show Data',
    from_date:        'From Date',
    to_date:          'To Date',

    add_expense:      'Add Expense',
    date:             'Date',
    vehicle:          'Vehicle',
    expense_type:     'Expense Type',
    amount:           'Amount (MYR)',
    fuel_liters:      'Fuel Volume (liters)',
    price_per_liter:  'Price per Liter (MYR)',
    distance:         'Distance (km)',
    odometer:         'Odometer (km)',
    receipt_no:       'Receipt No.',
    notes:            'Notes',
    btn_save:         'Save',
    btn_reset:        'Reset',
    save_success:     'Saved successfully ✅',
    save_offline:     'Saved offline (pending sync) 📴',
    save_error:       'An error occurred',
    select_dept:      '-- Select Department --',
    select_vehicle:   '-- Select Vehicle --',
    select_type:      '-- Select Type --',

    expense_list:     'Expense List',
    col_date:         'Date',
    col_dept:         'Department',
    col_vehicle:      'Vehicle',
    col_vtype:        'Type',
    col_category:     'Category',
    col_distance:     'Distance',
    col_amount:       'Amount',
    col_notes:        'Notes',
    col_actions:      'Actions',
    total_label:      'Total:',
    no_data:          'No data found',
    confirm_delete:   'Confirm delete this record?',
    delete_success:   'Record deleted',

    vehicle_list:     'Vehicle List',
    add_vehicle:      'Add Vehicle',
    col_plate:        'License Plate',
    col_name:         'Name',
    col_brand:        'Brand/Model',
    col_brand_only:   'Brand',
    col_model:        'Model',
    col_year:         'Year',
    col_fuel:         'Fuel',
    no_vehicles:      'No vehicles yet',
    confirm_del_veh:  'Confirm delete this vehicle?',

    report_title:     'Reports',
    group_by:         'Group By',
    group_category:   'Expense Category',
    group_dept:       'Department',
    group_vtype:      'Vehicle Type',
    group_vehicle:    'Vehicle',
    group_month:      'Monthly',
    btn_report:       'Generate Report',
    btn_print:        'Print',
    col_item:         'Item',
    col_total:        'Amount',
    col_pct:          'Share',
    col_count:        'Count',
    col_km:           'Distance',
    grand_total:      'Grand Total',

    user_management:  'User Management',
    add_user:         'Add User',
    col_email:        'Email',
    col_fullname:     'Full Name',
    col_role:         'Role',
    col_vehicles:     'Assigned Vehicles',
    role_admin:       'Administrator',
    role_manager:     'Manager',
    role_user:        'User',

    access_logs:      'Access Logs',
    col_user:         'User',
    col_action:       'Action',
    col_details:      'Details',
    col_time:         'Time',

    settings:         'Settings',
    dept_mgmt:        'Departments',
    vtype_mgmt:       'Vehicle Types',
    btn_add:          'Add',
    btn_edit:         'Edit',
    btn_delete:       'Delete',
    btn_cancel:       'Cancel',
    btn_confirm:      'Confirm',
    col_desc:         'Description',
    col_code:         'Code',

    fuel_grade:       'Fuel Grade',
    select_grade:     '-- Select Grade --',

    scan_receipt:     'Scan Receipt',
    scanning:         'Scanning...',
    scan_result:      'Scan Result',
    scan_confirm:     'Use this amount',
    scan_error:       'Scan failed, enter manually',
    currency:         'RM',

    online:           'Online',
    offline:          'Offline',
    syncing:          'Syncing...',
    sync_done:        'Synced',
    pending_sync:     'Pending Sync',
    export:           'Export Data',

    fuel_gasoline:    'Gasoline',
    fuel_diesel:      'Diesel',
    fuel_ev:          'Electric',
    fuel_hybrid:      'Hybrid',
    fuel_lpg:         'LPG',
    fuel_ngv:         'NGV',
  }
};

let currentLang = localStorage.getItem('lang') || 'th';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['th']?.[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  // Update all lang toggle buttons (login + app topbar)
  ['lang-th','lang-th-app'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.toggle('active-lang', lang === 'th');
  });
  ['lang-en','lang-en-app'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.toggle('active-lang', lang === 'en');
  });
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}
              