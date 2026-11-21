# Klai Chumchon (ใกล้ชุมชน)

แพลตฟอร์มแจ้งปัญหาในชุมชน (Community Issue Reporter) ประชาชนแจ้งปัญหา เช่น ถนนชำรุด ไฟดับ น้ำท่วม พร้อมรูปและพิกัดบนแผนที่ แล้วเจ้าหน้าที่อัปเดตสถานะ **รอดำเนินการ → กำลังแก้ไข → เสร็จสิ้น** โดยระบบเก็บประวัติการเปลี่ยนสถานะทุกครั้ง

CS319 Internet Programming I · Final Project · สถาปัตยกรรม Modern Decoupled SPA

## สมาชิก

| ชื่อ | รหัสนักศึกษา | ส่วนที่รับผิดชอบ |
|---|---|---|
| ชินวัตร อ่วมแก้ว | 1660701283 | Database: `schema.prisma`, migration, `seed.ts`, Prisma Studio |
| ศรีรัตน์ อินทลัย | 1660705185 | UI: `router.tsx`, MainLayout, pages, components, DaisyUI และ responsive |
| นิชาภา ศรีแจ่มใส | 1660706050 | State: Zustand stores, TanStack Query hooks, `reportApi.ts` |
| บุญพิทักษ์ โรจนประภาวสุ | 1660707538 | Backend API: `server.ts`, routes, controllers, validators, middlewares |

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Vite, React 19 (TypeScript), React Router v7, Tailwind CSS v4 + DaisyUI 5, Leaflet (react-leaflet), lucide-react (ไอคอน) |
| Client State | Zustand (persist ลง LocalStorage) |
| Server Cache | TanStack Query v5 |
| Backend | Node.js, Express 5 (TypeScript), cors, dotenv, express.json(), JWT, bcryptjs, multer |
| Database | PostgreSQL + Prisma ORM 7 (adapter-pg) |
| API ภายนอก | Nominatim (OpenStreetMap) แปลงพิกัด/ค้นหาสถานที่, Open-Meteo Air Quality ค่าฝุ่น PM2.5 (เรียกผ่าน server ไม่ต้องใช้ API key) |

## ฟีเจอร์หลัก

- **แผนที่ Leaflet:** หมุดทุกเรื่องแยกสีตามสถานะ (แดง = รอดำเนินการ, เหลือง = กำลังแก้ไข, เขียว = เสร็จสิ้น) คลิกหมุดจะเห็นสรุปและลิงก์ไปหน้ารายละเอียด
- **แจ้งปัญหา:** ปักหมุดบนแผนที่หรือกดใช้ตำแหน่งปัจจุบัน และแนบรูปได้ (JPG/PNG/WEBP ไม่เกิน 5MB ตรวจจากเนื้อไฟล์จริง)
- **ที่อยู่อัตโนมัติ + ค้นหาสถานที่ (Nominatim):** ปักหมุดแล้วระบบแปลงพิกัดเป็นที่อยู่ให้เอง หรือพิมพ์ชื่อสถานที่เพื่อเลื่อนแผนที่ไปหา
- **คุณภาพอากาศ (Open-Meteo):** หน้ารายละเอียดแสดงค่า PM2.5 / PM10 ณ จุดที่แจ้ง พร้อมระดับตามเกณฑ์กรมควบคุมมลพิษ
- **ที่อยู่อัตโนมัติ + ค้นหาสถานที่ (Nominatim):** ปักหมุดแล้วระบบแปลงพิกัดเป็นที่อยู่ให้เอง หรือพิมพ์ชื่อสถานที่เพื่อเลื่อนแผนที่ไปหา
- **คุณภาพอากาศ (Open-Meteo):** หน้ารายละเอียดแสดงค่า PM2.5 / PM10 ณ จุดที่แจ้ง พร้อมระดับตามเกณฑ์กรมควบคุมมลพิษ
- **ตัวกรองแบบ pill + เรียง "ใกล้ฉัน":** กรองสถานะและหมวดหมู่ด้วยการกดครั้งเดียว (ใช้ร่วมกันหน้ารายการและแผนที่) และเรียงเรื่องจากใกล้ไปไกลตามตำแหน่งของผู้ใช้ พร้อมบอกระยะห่าง
- **3 Role:** ประชาชน / เจ้าหน้าที่ / แอดมิน ล็อกอินด้วยอีเมลและรหัสผ่าน (เก็บแบบ bcrypt hash) ใช้ JWT ยืนยันตัวตน
- **StatusLog:** ทุกครั้งที่เปลี่ยนสถานะจะบันทึกว่าใครเปลี่ยน เปลี่ยนจากอะไรเป็นอะไร และหมายเหตุ แสดงเป็นไทม์ไลน์ในหน้ารายละเอียด
- **ความคิดเห็น:** ผู้ใช้ที่ล็อกอินแสดงความคิดเห็นได้ พร้อมป้ายบอก role
- **ติดตามเรื่อง:** กด ☆ เพื่อติดตาม (เก็บในเครื่อง ไม่ต้องล็อกอิน)
- Responsive, Skeleton ระหว่างโหลด, Error Alert, Toast, Dark mode

### สิทธิ์ของแต่ละ Role

| การกระทำ | ไม่ล็อกอิน | ประชาชน | เจ้าหน้าที่ | แอดมิน |
|---|:-:|:-:|:-:|:-:|
| ดูรายการ / แผนที่ / รายละเอียด | ✅ | ✅ | ✅ | ✅ |
| แจ้งปัญหา / แสดงความคิดเห็น | | ✅ | ✅ | ✅ |
| แก้ไขเรื่อง | | ของตัวเอง (ตอนรอดำเนินการ) | ✅ | ✅ |
| ลบเรื่อง | | ของตัวเอง (ตอนรอดำเนินการ) | | ✅ |
| เปลี่ยนสถานะ | | | ✅ | ✅ |
| จัดการ role ผู้ใช้ | | | | ✅ |

## บัญชีสาธิต (จาก seed)

รหัสผ่านทุกบัญชี: `demo1234`

| Role | อีเมล |
|---|---|
| แอดมิน | `admin@klai.local` |
| เจ้าหน้าที่ | `staff1@klai.local`, `staff2@klai.local` |
| ประชาชน | `somchai@klai.local`, `somying@klai.local`, `prayoon@klai.local`, `malee@klai.local`, `wichai@klai.local` |

## โครงสร้างโฟลเดอร์

```
Klai-Chumchon/
├── client/                         # Frontend (port 5173)
│   ├── public/members/             # รูปสมาชิกสำหรับหน้า About
│   └── src/
│       ├── api/reportApi.ts        # ฟังก์ชัน fetch ไปยัง REST API (แนบ JWT ให้อัตโนมัติ)
│       ├── hooks/                  # useReports.ts, useAuth.ts (useQuery / useMutation)
│       ├── stores/                 # useUiStore.ts, useAuthStore.ts (Zustand)
│       ├── layouts/MainLayout.tsx
│       ├── components/             # MapView, ReportCard, ReportForm, RequireAuth, Badges, Feedback, ConfirmModal, AirQualityCard
│       ├── pages/                  # Home, ReportList, ReportDetail, New, Edit, Map, MyReports,
│       │                           # Bookmarks, Admin, About, Login, Register, NotFound
│       ├── router.tsx
│       ├── types.ts
│       └── main.tsx
├── server/                         # Backend (port 3000)
│   ├── prisma/
│   │   ├── schema.prisma           # User, Category, Report, StatusLog, Comment
│   │   ├── migrations/
│   │   └── seed.ts                 # 8 ผู้ใช้, 6 หมวด, 50 เรื่อง, ประวัติสถานะ, ความคิดเห็น
│   ├── uploads/                    # รูปที่ผู้ใช้อัปโหลด (ไม่ขึ้น git)
│   └── src/
│       ├── server.ts
│       ├── lib/prisma.ts
│       ├── routes/                 # authRoutes.ts, reportRoutes.ts, geoRoutes.ts
│       ├── controllers/            # auth, user, report, comment, category, geo (เรียก API ภายนอก)
│       ├── middlewares/            # auth.ts (JWT + role), upload.ts (multer), errorHandler.ts
│       ├── validators/reportValidator.ts
│       └── types/
└── docs/SUPABASE.md                # คู่มือย้ายฐานข้อมูลขึ้น Supabase
```

## หน้าเว็บ

| Path | หน้า | สิทธิ์ |
|---|---|---|
| `/` | หน้าแรก: สถิติ, หมวดหมู่, เรื่องล่าสุด | ทุกคน |
| `/reports` | รายการทั้งหมด (Items Master) ค้นหา/กรอง | ทุกคน |
| `/reports/:id` | รายละเอียด (Dynamic Detail) แผนที่ ไทม์ไลน์สถานะ ความคิดเห็น | ทุกคน |
| `/map` | แผนที่รวมทุกเรื่อง | ทุกคน |
| `/bookmarks` | เรื่องที่ติดตาม | ทุกคน |
| `/about` | เกี่ยวกับเรา / สมาชิก | ทุกคน |
| `/login`, `/register` | เข้าสู่ระบบ / สมัครสมาชิก | ทุกคน |
| `/reports/new` | แจ้งปัญหา | ล็อกอิน |
| `/reports/:id/edit` | แก้ไข | ล็อกอิน (ตามสิทธิ์) |
| `/my-reports` | เรื่องที่ฉันแจ้ง | ล็อกอิน |
| `/admin` | จัดการระบบ (เรื่อง + ผู้ใช้) | เจ้าหน้าที่ / แอดมิน |

## REST API

| Method | Endpoint | สิทธิ์ | หน้าที่ | Status |
|---|---|---|---|---|
| GET | `/api/health` | - | เช็กว่า server ทำงาน | 200 |
| POST | `/api/auth/register` | - | สมัครสมาชิก (role ประชาชน) | 201 / 400 / 409 |
| POST | `/api/auth/login` | - | เข้าสู่ระบบ ได้ JWT (ผิดเกิน 5 ครั้งใน 15 นาทีต้องรอ) | 200 / 400 / 401 / 429 |
| GET | `/api/auth/me` | ล็อกอิน | ข้อมูลผู้ใช้ปัจจุบัน | 200 / 401 |
| GET | `/api/users` | แอดมิน | รายชื่อผู้ใช้ | 200 / 401 / 403 |
| PATCH | `/api/users/:id/role` | แอดมิน | เปลี่ยน role | 200 / 400 / 403 / 404 |
| GET | `/api/categories` | - | หมวดหมู่ + จำนวนเรื่อง | 200 |
| GET | `/api/reports?search=&status=&categoryId=&reporterId=` | - | รายการเรื่อง | 200 |
| GET | `/api/reports/:id` | - | รายละเอียด + ความคิดเห็น + StatusLog | 200 / 400 / 404 |
| POST | `/api/reports` | ล็อกอิน | แจ้งเรื่อง (multipart + รูป) | 201 / 400 / 401 |
| PUT | `/api/reports/:id` | ตามสิทธิ์ | แก้ไขเรื่อง | 200 / 400 / 403 / 404 |
| PATCH | `/api/reports/:id/status` | เจ้าหน้าที่/แอดมิน | เปลี่ยนสถานะ + บันทึก StatusLog (มีคนเปลี่ยนไปก่อนได้ 409) | 200 / 400 / 403 / 404 / 409 |
| DELETE | `/api/reports/:id` | ตามสิทธิ์ | ลบเรื่อง (ความคิดเห็น/StatusLog/รูปลบตาม) | 200 / 403 / 404 |
| POST | `/api/reports/:id/comments` | ล็อกอิน | เพิ่มความคิดเห็น | 201 / 400 / 404 |
| DELETE | `/api/comments/:id` | เจ้าของ/แอดมิน | ลบความคิดเห็น | 200 / 403 / 404 |
| GET | `/api/geo/reverse?lat=&lng=` | - | พิกัด → ที่อยู่ (Nominatim) | 200 / 400 / 502 |
| GET | `/api/geo/search?q=` | - | ค้นหาสถานที่ในไทย (Nominatim) | 200 / 400 / 502 |
| GET | `/api/geo/air?lat=&lng=` | - | ค่าฝุ่น PM2.5 / PM10 ปัจจุบัน (Open-Meteo) | 200 / 400 / 502 |

ทุก response ใช้รูปแบบ `{ success, message?, data? }` ข้อมูลไม่ผ่าน validation จะได้ 400 พร้อม `errors`

## ภาพหน้าจอ

อยู่ในโฟลเดอร์ [`screenshots/`](screenshots/) ถ่ายจากระบบที่รันจริง (ข้อมูลจาก seed)

| ไฟล์ | หน้า |
|---|---|
| 01–09 | หน้าแรก, รายการ, รายละเอียด, แผนที่, ที่ติดตาม, เกี่ยวกับเรา, เข้าสู่ระบบ, สมัครสมาชิก, 404 |
| 10–14 | (ประชาชน) แจ้งปัญหา, error ในฟอร์ม, แก้ไขเรื่อง, เรื่องของฉัน, หน้าที่ไม่มีสิทธิ์ |
| 15–16 | (เจ้าหน้าที่) รายละเอียด + กล่องอัปเดตสถานะ, modal เปลี่ยนสถานะ |
| 17–19 | (แอดมิน) จัดการเรื่อง, จัดการผู้ใช้, ยืนยันการลบ |
| 20–23 | โหมดมืด, Skeleton ตอนโหลด, Error Alert, Server ไม่ตอบ |
| 24 | Schema database (Supabase Schema Visualizer) 5 ตาราง + _prisma_migrations พร้อมความสัมพันธ์ FK |
| 25–26 | Prisma Studio: ตาราง Report, ตาราง StatusLog |
| 27–29 | (API ภายนอก) ค้นหาสถานที่, ที่อยู่ขึ้นเองหลังปักหมุด (Nominatim), ค่าฝุ่น PM2.5 ในหน้ารายละเอียด (Open-Meteo) |

## วิธีติดตั้งและรัน

ต้องมี Node.js 20+ และ PostgreSQL (ในเครื่อง หรือ Supabase ดู [docs/SUPABASE.md](docs/SUPABASE.md))

```bash
# 1. ติดตั้งแพ็กเกจ (ทั้ง client และ server)
npm install

# 2. ตั้งค่า (แก้ DATABASE_URL และ JWT_SECRET)
cp server/.env.example server/.env

# 3. สร้างตารางและใส่ข้อมูลตัวอย่าง
npm run db:migrate
npm run db:seed

# 4. รัน frontend + backend พร้อมกัน
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/health
- Prisma Studio: `npm run db:studio` (http://localhost:5555)

คำสั่งตรวจโค้ด: `npm run typecheck`, `npm run lint`, `npm run build`

## การแยก State (Dual-State)

- **TanStack Query** เป็นเจ้าของข้อมูลจากฐานข้อมูลทั้งหมด (เรื่องที่แจ้ง, รายละเอียด, หมวดหมู่, ผู้ใช้ปัจจุบัน `/auth/me`, รายชื่อผู้ใช้) หลัง create/update/delete จะเรียก `queryClient.invalidateQueries()` ให้หน้าจออัปเดตทันทีโดยไม่ต้องรีเฟรช
- **Zustand** เก็บเฉพาะสถานะฝั่ง client:
  - `useUiStore`: ธีม, id เรื่องที่ติดตาม (persist), ตัวกรอง (ใช้ร่วมกันระหว่างหน้ารายการกับแผนที่), toast
  - `useAuthStore`: JWT token (persist) โดยไม่เก็บข้อมูลผู้ใช้ซ้ำ ข้อมูลผู้ใช้ดึงจาก TanStack Query

## หมายเหตุ

- ข้อมูลใน `seed.ts` เป็นข้อมูลสมมติสำหรับทดสอบระบบ ชื่อบุคคลและจุดสังเกตไม่ใช่ข้อมูลจริง พิกัดกระจายรอบมหาวิทยาลัยกรุงเทพ วิทยาเขตรังสิต (จุดกลางโดยประมาณ)
- แผนที่ใช้ tile จาก OpenStreetMap ต้องต่ออินเทอร์เน็ต
- ใส่รูปสมาชิกในหน้า About ได้โดยวางไฟล์ใน `client/public/members/` แล้วใส่ชื่อไฟล์ที่ช่อง `photo` ใน `client/src/pages/AboutPage.tsx`
