import { initialOf } from "../utils";
// ข้อมูลสมาชิกกลุ่ม ใส่รูปได้โดยวางไฟล์ใน client/public/members/ แล้วใส่ชื่อไฟล์ที่ photo
interface Member {
  name: string;
  nickname?: string;
  studentId: string;
  role: string;
  work: string;
  photo?: string;
}

const members: Member[] = [
  {
    name: "ชินวัตร อ่วมแก้ว",
    nickname: "ฟิว",
    studentId: "1660701283",
    photo: "1660701283.jpg",
    role: "Database",
    work: "ออกแบบ schema.prisma (Relations, Constraints), Prisma Migrate, สคริปต์ seed.ts และตรวจข้อมูลด้วย Prisma Studio",
  },
  {
    name: "ศรีรัตน์ อินทลัย",
    nickname: "หยก",
    studentId: "1660705185",
    photo: "1660705185.jpg",
    role: "Frontend UI",
    work: "router.tsx, MainLayout, หน้าเว็บทั้งหมด, components, DaisyUI และ Responsive Design",
  },
  {
    name: "นิชาภา ศรีแจ่มใส",
    studentId: "1660706050",
    photo: "1660706050.jpg",
    role: "State Management",
    work: "Zustand store (ธีม, บุ๊กมาร์ก, ตัวกรอง, token), TanStack Query hooks และ reportApi.ts",
  },
  {
    name: "บุญพิทักษ์ โรจนประภาวสุ",
    studentId: "1660707538",
    photo: "1660707538.jpg",
    role: "Backend API",
    work: "server.ts, routes, controllers, validators, errorHandler, ระบบ login/สิทธิ์ และอัปโหลดรูป",
  },
];

const stack = [
  ["Frontend", "Vite, React 19 + TypeScript, React Router v7, Tailwind CSS + DaisyUI, Leaflet"],
  ["State", "Zustand (Client State) + TanStack Query (Server Cache)"],
  ["Backend", "Node.js, Express 5 + TypeScript, JWT, bcrypt, multer"],
  ["Database", "PostgreSQL (Supabase) + Prisma ORM"],
  ["API ภายนอก", "Nominatim (OpenStreetMap) ที่อยู่และค้นหาสถานที่, Open-Meteo ค่าฝุ่น PM2.5"],
];


export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">เกี่ยวกับ Klai Chumchon</h1>
        <p className="text-base-content/70">
          แพลตฟอร์มแจ้งปัญหาในชุมชน สำหรับ Final Project วิชา CS319 Internet Programming I
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m) => (
          <div key={m.studentId} className="card bg-base-100 border border-base-300">
            <div className="card-body items-center text-center gap-2">
              {m.photo ? (
                <img src={`/members/${m.photo}`} alt={m.name} className="w-28 h-28 rounded-full object-cover object-[50%_20%]" />
              ) : (
                <div className="avatar avatar-placeholder">
                  <div className="bg-secondary text-secondary-content w-28 rounded-full">
                    <span className="text-4xl">{initialOf(m.name)}</span>
                  </div>
                </div>
              )}
              <h2 className="text-lg font-semibold">{m.name}</h2>
              <p className="text-sm">
                {m.nickname && <>ชื่อเล่น {m.nickname} · </>}รหัส {m.studentId}
              </p>
              <span className="badge badge-secondary">{m.role}</span>
              <p className="text-sm text-base-content/70">{m.work}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">เทคโนโลยีที่ใช้</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <tbody>
                {stack.map(([k, v]) => (
                  <tr key={k}>
                    <th className="w-32">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-base-content/70">
            ข้อมูลเรื่องที่แจ้งในระบบเป็นข้อมูลตัวอย่างสำหรับการเรียน ชื่อบุคคลและจุดสังเกตไม่ใช่ข้อมูลจริง
          </p>
        </div>
      </div>
    </div>
  );
}
