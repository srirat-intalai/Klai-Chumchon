# คู่มือย้ายฐานข้อมูลขึ้น Supabase

ตอนนี้โปรเจกต์ใช้ PostgreSQL ที่ติดตั้งในเครื่อง คู่มือนี้คือขั้นตอนย้ายไปใช้ PostgreSQL บน Supabase (cloud) เพื่อให้ทุกคนในกลุ่มใช้ฐานข้อมูลชุดเดียวกัน และถ่ายภาพ Schema Visualizer ส่งอาจารย์ได้

**ไม่ต้องแก้โค้ด** เปลี่ยนแค่ `DATABASE_URL` ในไฟล์ `server/.env` แล้วรันคำสั่ง Prisma

ใช้เวลาประมาณ 15–20 นาที

---

## สิ่งที่ต้องมีก่อน

- clone โปรเจกต์มาแล้ว และรัน `npm install` ที่โฟลเดอร์หลักของโปรเจกต์แล้ว
- บัญชี GitHub (ใช้สมัคร Supabase)

---

## ขั้นที่ 1: สร้างโปรเจกต์ Supabase

1. เข้า https://supabase.com แล้วกด **Start your project** จากนั้นล็อกอินด้วย GitHub
2. สร้าง Organization (ถ้ายังไม่มี) เลือกแผน **Free**
3. กด **New project** แล้วตั้งค่า:
   - **Project name:** `Klai-Chumchon`
   - **Database password:** กด Generate แล้ว **จดเก็บไว้** (ต้องใช้ในขั้นที่ 2 และดูซ้ำไม่ได้)
   - **Region:** Southeast Asia (Singapore)
4. กด **Create new project** แล้วรอจนสถานะเป็นสีเขียว (Healthy) ประมาณ 1–2 นาที

## ขั้นที่ 2: คัดลอก Connection String

1. ในหน้าโปรเจกต์ กดปุ่ม **Connect** ด้านบน
2. เลือกแท็บ **Connection String** แล้วเลือกแบบ **Session pooler** (พอร์ต `5432`)
   - ใช้ Session pooler เพราะใช้ได้ทุกเครือข่าย ทั้งเน็ตมหาวิทยาลัยและหอพัก ส่วน Direct connection บางเครือข่ายต่อไม่ได้
3. คัดลอก URI ที่ได้ หน้าตาประมาณนี้:

   ```
   postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

4. แทน `[YOUR-PASSWORD]` ด้วยรหัสผ่านจากขั้นที่ 1 **และลบวงเล็บ `[ ]` ออกด้วย**

   ```
   ❌ postgres.abc:[MyPass123]@aws-0...
   ✅ postgres.abc:MyPass123@aws-0...
   ```

   > ถ้ารหัสผ่านมีอักขระพิเศษ เช่น `@ # / ?` ต้องแปลงก่อน เช่น `@` → `%40`, `#` → `%23` หรือกด Reset password ใน Supabase ให้ได้รหัสที่มีแต่ตัวอักษรกับตัวเลข

## ขั้นที่ 3: ใส่ใน `server/.env`

ถ้ายังไม่มีไฟล์ ให้คัดลอกจากตัวอย่างก่อน:

```bash
cp server/.env.example server/.env
```

แล้วแก้ `server/.env` ให้เป็นแบบนี้:

```env
DATABASE_URL="postgresql://postgres.abcdefghijk:MyPass123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
CLIENT_ORIGIN="http://localhost:5173"
PORT=3000
JWT_SECRET="ข้อความสุ่มยาวๆ อย่างน้อย 32 ตัว"
```

สร้าง `JWT_SECRET` แบบสุ่มได้ด้วยคำสั่ง:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ **ห้าม commit ไฟล์ `.env` ขึ้น GitHub** (อยู่ใน `.gitignore` แล้ว) ถ้าจะแชร์ให้เพื่อนในกลุ่ม ให้ส่งทางแชทส่วนตัว

## ขั้นที่ 4: สร้างตารางและใส่ข้อมูลตัวอย่าง

รันที่โฟลเดอร์หลักของโปรเจกต์:

```bash
cd server
npx prisma migrate deploy   # สร้างตารางตามไฟล์ใน prisma/migrations
npx prisma generate         # สร้าง Prisma Client
npm run db:seed             # ใส่ข้อมูลตัวอย่าง
cd ..
```

ถ้าสำเร็จจะเห็นข้อความ:

```
เสร็จ: 8 ผู้ใช้, 6 หมวด, 40 เรื่อง, 79 ประวัติสถานะ, 40 ความคิดเห็น
```

> ใช้ `migrate deploy` ไม่ใช่ `migrate dev` เพราะไฟล์ migration มีอยู่แล้วในโปรเจกต์ แค่นำไปสร้างตารางบน Supabase

## ขั้นที่ 5: ทดสอบ

```bash
npm run dev
```

- เปิด http://localhost:3000/api/health ต้องเห็น `"success": true`
- เปิด http://localhost:5173 ต้องเห็นเรื่องที่แจ้ง 40 เรื่องและหมุดบนแผนที่
- ลองล็อกอินด้วย `admin@klai.local` / `demo1234`

ตรวจข้อมูลได้ 2 ทาง:

- **Prisma Studio:** `npm run db:studio` แล้วเปิด http://localhost:5555
- **Supabase:** เมนู **Table Editor**

## ขั้นที่ 6: ถ่ายภาพ Schema ส่งอาจารย์

1. ใน Supabase ไปที่ **Database → Schema Visualizer**
2. จะเห็นตาราง `User`, `Category`, `Report`, `StatusLog`, `Comment` พร้อมเส้นความสัมพันธ์ (FK)
3. จัดตำแหน่งให้อ่านง่าย แล้วถ่ายภาพให้เห็นชื่อ Organization และ Project ด้านบน (ตามตัวอย่างในสไลด์ Week 12)

---

## ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `P1001 Can't reach database server` | เน็ตบล็อกพอร์ต ลองแชร์ Hotspot จากมือถือ หรือตรวจว่าใช้ **Session pooler** แล้ว |
| `P1000 Authentication failed` | รหัสผ่านผิด หรือลืมลบ `[ ]` ออก |
| `self-signed certificate in certificate chain` | เติม `?sslmode=no-verify` ต่อท้าย `DATABASE_URL` |
| `Cannot resolve environment variable: DATABASE_URL` | ไม่ได้สร้างไฟล์ `server/.env` หรือรันคำสั่งผิดโฟลเดอร์ (ต้องอยู่ใน `server/`) |
| seed แล้วขึ้น foreign key error | รัน `npx prisma migrate deploy` ก่อน seed |
| อยากล้างข้อมูลแล้ว seed ใหม่ | รัน `npm run db:seed` ซ้ำได้เลย สคริปต์ลบของเก่าให้ก่อนทุกครั้ง |

## สิ่งที่ควรรู้

- **รูปที่อัปโหลด** เก็บในโฟลเดอร์ `server/uploads/` ของเครื่องที่รัน server ไม่ได้เก็บบน Supabase ถ้าคนอื่นรัน server จากเครื่องตัวเอง จะไม่เห็นรูปที่คุณอัปโหลด (แต่ข้อมูลอื่นเห็นตรงกันหมด)
- **ถ้าใช้ Supabase โปรเจกต์เดียวกันทั้งกลุ่ม** ให้คนเดียวทำขั้นที่ 4 คนอื่นแค่ใส่ `DATABASE_URL` ชุดเดียวกันในขั้นที่ 3 แล้วรัน `npx prisma generate` ก็พอ
- **อย่ารัน `npm run db:seed` ระหว่างที่เพื่อนกำลังถ่ายวิดีโอ** เพราะจะล้างข้อมูลทั้งหมดแล้วใส่ใหม่
- โปรเจกต์ฟรีของ Supabase จะ **หยุดชั่วคราวถ้าไม่มีการใช้งาน 7 วัน** ก่อนวันนำเสนอให้เข้าไปกด Restore ใน dashboard
