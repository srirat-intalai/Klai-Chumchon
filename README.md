# Klai Chumchon (ใกล้ชุมชน)

เว็บแอปให้คนในชุมชนแจ้งปัญหาใกล้ตัว เช่น ถนนชำรุด ไฟส่องทางดับ น้ำท่วม หรือขยะล้น แล้วติดตามได้ว่าเจ้าหน้าที่รับเรื่องและแก้ไขถึงขั้นไหนแล้ว

CS319 Internet Programming I · Final Project · สถาปัตยกรรม Modern Decoupled SPA

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Vite, React 19 (TypeScript), React Router v7, Tailwind CSS v4 + DaisyUI 5 |
| Client State | Zustand (persist ลง LocalStorage) |
| Server Cache | TanStack Query v5 |
| Backend | Node.js, Express 5 (TypeScript), cors, dotenv, express.json() |
| Database | PostgreSQL + Prisma ORM 7 (adapter-pg) |

## โครงสร้างโฟลเดอร์

```
Klai-Chumchon/
├── client/                     # Frontend (port 5173)
│   └── src/
│       ├── api/reportApi.ts    # ฟังก์ชัน fetch ไปยัง REST API
│       ├── hooks/useReports.ts # useQuery / useMutation + invalidateQueries
│       ├── stores/useUiStore.ts# Zustand: ธีม, บุ๊กมาร์ก, ตัวกรอง, toast
│       ├── layouts/MainLayout.tsx
│       ├── components/         # ReportCard, ReportForm, Badges, Feedback, ConfirmModal
│       ├── pages/              # Home, ReportList, ReportDetail, New, Edit, Bookmarks, Admin, NotFound
│       ├── router.tsx          # createBrowserRouter
│       ├── types.ts
│       └── main.tsx
└── server/                     # Backend (port 3000)
    ├── prisma/
    │   ├── schema.prisma       # Category, Report, Comment + enum
    │   ├── migrations/
    │   └── seed.ts             # 6 หมวด, 40 เรื่อง, ความคิดเห็นตัวอย่าง
    ├── prisma.config.ts
    └── src/
        ├── server.ts           # Express + middleware
        ├── lib/prisma.ts       # PrismaClient + pg Pool
        ├── routes/reportRoutes.ts
        ├── controllers/        # report, comment, category
        ├── validators/reportValidator.ts
        ├── middlewares/errorHandler.ts
        └── types.ts
```

## หน้าเว็บ

| Path | หน้า |
|---|---|
| `/` | หน้าแรก: สถิติ, หมวดหมู่, เรื่องล่าสุด |
| `/reports` | รายการทั้งหมด (Items Master) ค้นหา/กรองหมวด/กรองสถานะ |
| `/reports/:id` | รายละเอียด (Dynamic Detail) + ความคิดเห็น + ติดตาม |
| `/reports/new` | ฟอร์มแจ้งปัญหา |
| `/reports/:id/edit` | ฟอร์มแก้ไข |
| `/bookmarks` | เรื่องที่ติดตาม (เก็บ id ใน Zustand) |
| `/admin` | จัดการระบบ: เปลี่ยนสถานะ, แก้ไข, ลบ |

## REST API

| Method | Endpoint | หน้าที่ | Status |
|---|---|---|---|
| GET | `/api/health` | เช็กว่า server ทำงาน | 200 |
| GET | `/api/categories` | หมวดหมู่ + จำนวนเรื่อง | 200 |
| GET | `/api/reports?search=&status=&categoryId=` | รายการเรื่อง | 200 |
| GET | `/api/reports/:id` | รายละเอียด + ความคิดเห็น | 200 / 400 / 404 |
| POST | `/api/reports` | แจ้งเรื่องใหม่ | 201 / 400 |
| PUT | `/api/reports/:id` | แก้ไขเรื่อง | 200 / 400 / 404 |
| PATCH | `/api/reports/:id/status` | เปลี่ยนสถานะ | 200 / 400 / 404 |
| DELETE | `/api/reports/:id` | ลบเรื่อง (ความคิดเห็นลบตาม) | 200 / 404 |
| POST | `/api/reports/:id/comments` | เพิ่มความคิดเห็น | 201 / 400 / 404 |
| DELETE | `/api/comments/:id` | ลบความคิดเห็น | 200 / 404 |

ทุก response ใช้รูปแบบ `{ success, message?, data? }` ถ้าข้อมูลไม่ผ่าน validation จะได้ 400 และ `errors` เป็นรายการข้อความ

## วิธีติดตั้งและรัน

ต้องมี Node.js 20+ และ PostgreSQL (เครื่องตัวเองหรือ Supabase)

```bash
# 1. ติดตั้งแพ็กเกจ (ทั้ง client และ server)
npm install

# 2. ตั้งค่าฐานข้อมูล
cp server/.env.example server/.env   # แล้วแก้ DATABASE_URL

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

- **TanStack Query** เป็นเจ้าของข้อมูลจากฐานข้อมูลทั้งหมด (รายการเรื่อง, รายละเอียด, หมวดหมู่) หลัง create/update/delete จะเรียก `queryClient.invalidateQueries()` เพื่อให้หน้าจออัปเดตทันทีโดยไม่ต้องรีเฟรช
- **Zustand** เก็บเฉพาะสถานะหน้าจอ: ธีม, id ของเรื่องที่ติดตาม (persist ลง LocalStorage), ตัวกรองค้นหา และข้อความแจ้งเตือน ไม่เก็บข้อมูลเรื่องที่แจ้งซ้ำ

## หมายเหตุ

ข้อมูลใน `seed.ts` เป็นข้อมูลสมมติสำหรับทดสอบระบบ ชื่อบุคคลและสถานที่ไม่ใช่ข้อมูลจริง ระบบนี้ยังไม่มีการล็อกอิน หน้า `/admin` จึงเปิดให้ทุกคนเข้าได้ (อยู่นอกขอบเขตของโจทย์)
