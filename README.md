# 🚗 VehicleTrack — ระบบจัดการค่าใช้จ่ายยานพาหนะ

ระบบ PWA (Progressive Web App) สำหรับบันทึกและติดตามค่าใช้จ่ายยานพาหนะ รองรับการใช้งานทั้งออนไลน์และออฟไลน์ พร้อมระบบ Login และ 2 ภาษา (ไทย/อังกฤษ)

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 📊 Dashboard | กราฟ KPI, ค่าใช้จ่ายตามหน่วยงาน/รถ/ประเภท |
| ➕ บันทึกค่าใช้จ่าย | น้ำมัน, เซอร์วิส, ซ่อม, ยาง, ประกัน, ทางด่วน ฯลฯ |
| 📋 รายการค่าใช้จ่าย | ค้นหา, กรอง, แก้ไข, ลบ |
| 📈 รายงาน | จัดกลุ่มตามประเภท/หน่วยงาน/ชนิดรถ/เดือน, พิมพ์ได้ |
| 🚙 จัดการรถ | เพิ่ม/แก้ไข/ลบรถ ผูกกับหน่วยงานและชนิดรถ |
| 👥 จัดการผู้ใช้ | Admin เท่านั้น — กำหนดสิทธิ์และรถที่รับผิดชอบ |
| 🔍 ประวัติการใช้งาน | บันทึก log ทุกการกระทำพร้อมผู้ใช้และเวลา |
| ⚙️ ตั้งค่า | จัดการหน่วยงานและชนิดรถ |
| 📴 Offline | บันทึกในเครื่อง, ซิงค์อัตโนมัติเมื่อ internet กลับมา |
| 🌐 2 ภาษา | สลับไทย/อังกฤษได้ทันที |

---

## 🔐 ระบบสิทธิ์ (Role-Based Access)

| สิทธิ์ | Dashboard | เพิ่มค่าใช้จ่าย | จัดการรถ | จัดการผู้ใช้ | Log |
|---|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ ทุกหน่วยงาน | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ หน่วยงานตนเอง | ✅ | ✅ | ❌ | ✅ |
| **User** | ✅ รถที่รับผิดชอบ | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 วิธีติดตั้งและ Deploy

### ขั้นตอนที่ 1 — สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) → **New Project**
2. ตั้งชื่อ project และ password สำหรับ database
3. รอ project สร้างเสร็จ (~2 นาที)

### ขั้นตอนที่ 2 — รัน SQL Schema

1. เปิด **Supabase Dashboard → SQL Editor**
2. คัดลอกเนื้อหาจากไฟล์ `supabase/schema.sql`
3. วางใน SQL Editor แล้วกด **Run**
4. ตรวจสอบว่า Tables ถูกสร้างครบ: `departments`, `vehicles`, `expenses`, `user_profiles`, `access_logs`

### ขั้นตอนที่ 3 — เอา Supabase Keys

1. ไปที่ **Supabase Dashboard → Settings → API**
2. คัดลอก:
   - **Project URL** (เช่น `https://abcxyz.supabase.co`)
   - **anon / public key** (ยาว ~200 ตัวอักษร)

### ขั้นตอนที่ 4 — ใส่ config

เปิดไฟล์ `js/config.js` แล้วแก้ไข:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';  // ← ใส่ Project URL
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';                 // ← ใส่ anon key
```

### ขั้นตอนที่ 5 — Deploy บน GitHub Pages

1. สร้าง GitHub Repository ใหม่ (public หรือ private)
2. Push โค้ดทั้งหมดขึ้น GitHub:

```bash
git init
git add .
git commit -m "Initial VehicleTrack v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. ไปที่ **GitHub → Repository → Settings → Pages**
4. Source: **GitHub Actions**
5. GitHub จะรัน workflow อัตโนมัติ (ไฟล์ `.github/workflows/pages.yml`)
6. รอ ~1 นาที แล้วเข้าใช้งานที่: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### ขั้นตอนที่ 6 — สร้าง Admin User คนแรก

1. ไปที่ **Supabase Dashboard → Authentication → Users → Add User**
2. กรอก email และ password
3. ไปที่ **Table Editor → user_profiles**
4. หา record ของ user ที่สร้าง แล้วเปลี่ยน `role` เป็น `admin`

---

## 📁 โครงสร้างไฟล์

```
VehicleTrack/
├── index.html              # Main SPA (หน้าหลักทั้งหมด)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache)
├── js/
│   ├── config.js           # ⚠️ ใส่ Supabase keys ที่นี่
│   ├── i18n.js             # ระบบ 2 ภาษา (TH/EN)
│   └── offline.js          # IndexedDB + Sync engine
├── icons/                  # PWA icons (72–512px)
├── supabase/
│   └── schema.sql          # SQL สำหรับสร้าง tables + RLS
├── .github/
│   └── workflows/
│       └── pages.yml       # GitHub Actions auto-deploy
│
│── ─ ไฟล์ Phase 1 (Local Node.js) ──────────────────────
├── server.js               # Express + SQLite backend
├── package.json
├── public/
│   ├── index.html          # Phase 1 frontend
│   └── manifest.json
└── คู่มือการใช้งาน.md      # คู่มือ Phase 1
```

---

## 📴 การทำงานแบบ Offline

เมื่อ internet ขาด:
- ข้อมูล master (รถ, หน่วยงาน) โหลดจาก IndexedDB ที่ cache ไว้
- การบันทึกค่าใช้จ่ายใหม่จะเก็บในเครื่องก่อน
- แถบสถานะจะแสดง `📴 ออฟไลน์`

เมื่อ internet กลับมา:
- ซิงค์อัตโนมัติทันที
- แสดงสถานะ `✅ ซิงค์สำเร็จ (N รายการ)`
- ใช้ `client_id` (UUID) ป้องกันข้อมูลซ้ำ

---

## 🛡️ ความปลอดภัย (Row Level Security)

Supabase RLS ป้องกัน:
- **Admin** — เห็นและแก้ไขข้อมูลทุกหน่วยงาน
- **Manager** — เห็นเฉพาะข้อมูลหน่วยงานตนเอง
- **User** — เห็นเฉพาะรถที่ถูก assign

แม้จะรู้ API key ก็ไม่สามารถดูข้อมูลหน่วยงานอื่นได้

---

## 📱 ติดตั้งเป็น App บนมือถือ

**Android (Chrome):**
1. เปิดเว็บใน Chrome
2. แตะเมนู ⋮ → **"Add to Home screen"**

**iOS (Safari):**
1. เปิดเว็บใน Safari
2. แตะปุ่ม Share → **"Add to Home Screen"**

---

## 🔧 ประเภทค่าใช้จ่ายที่รองรับ

| ไอคอน | ประเภท |
|---|---|
| ⛽ | ค่าน้ำมัน |
| 🔧 | ค่าเซอร์วิสตามระยะ |
| 🔨 | ค่าซ่อม |
| 🛞 | ค่าเปลี่ยนยาง |
| 🛡️ | ประกันภัย |
| 🛣️ | ค่าทางด่วน / ค่าผ่านทาง |
| 🅿️ | ค่าจอดรถ |
| 📋 | พ.ร.บ. / ภาษีรถ |
| 📝 | ค่าใช้จ่ายอื่นๆ |

---

## 🐛 แก้ปัญหาที่พบบ่อย

**ล็อกอินไม่ได้:**
- ตรวจสอบ `SUPABASE_URL` และ `SUPABASE_ANON` ใน `js/config.js`
- ตรวจสอบว่า user มีอยู่ใน Supabase Auth

**ข้อมูลไม่แสดง:**
- เปิด DevTools → Console ดู error
- ตรวจสอบว่ารัน `supabase/schema.sql` ครบแล้ว
- ตรวจสอบ RLS policies ใน Supabase Dashboard → Authentication → Policies

**GitHub Pages 404:**
- ตรวจสอบว่า Pages ตั้ง source เป็น "GitHub Actions"
- ดู Actions tab ว่า workflow ผ่านหรือไม่

**ซิงค์ไม่ทำงาน:**
- ตรวจสอบว่า column `client_id` มีอยู่ใน table `expenses`
- ดู browser Console ขณะกด "ออนไลน์"
