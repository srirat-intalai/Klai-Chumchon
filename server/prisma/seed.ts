// ข้อมูลตัวอย่างสำหรับทดสอบระบบ (ชื่อคน/จุดสังเกตเป็นข้อมูลสมมติ พิกัดกระจายรอบ ม.กรุงเทพ วิทยาเขตรังสิต)
import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { Priority, ReportStatus, Role } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// รหัสผ่านเดียวกันทุกบัญชี ไว้ใช้ตอนสาธิต
const DEMO_PASSWORD = "demo1234";

const users: { name: string; email: string; role: Role; phone: string | null }[] = [
  { name: "ผู้ดูแลระบบ", email: "admin@klai.local", role: "ADMIN", phone: null },
  { name: "เจ้าหน้าที่ สมศักดิ์", email: "staff1@klai.local", role: "STAFF", phone: "0811111111" },
  { name: "เจ้าหน้าที่ วันดี", email: "staff2@klai.local", role: "STAFF", phone: "0822222222" },
  { name: "สมชาย ใจดี", email: "somchai@klai.local", role: "CITIZEN", phone: "0833333333" },
  { name: "สมหญิง รักถิ่น", email: "somying@klai.local", role: "CITIZEN", phone: null },
  { name: "ประยูร มีสุข", email: "prayoon@klai.local", role: "CITIZEN", phone: "0844444444" },
  { name: "มาลี ศรีชุมชน", email: "malee@klai.local", role: "CITIZEN", phone: null },
  { name: "วิชัย ทองดี", email: "wichai@klai.local", role: "CITIZEN", phone: "0855555555" },
];

// icon = ชื่อคีย์ หน้าบ้านแปลงเป็นไอคอน SVG เอง (ดู CategoryIcon.tsx)
const categories = [
  { name: "ถนนและทางเท้า", icon: "road" },
  { name: "ไฟฟ้าและไฟส่องทาง", icon: "light" },
  { name: "น้ำประปาและน้ำท่วม", icon: "water" },
  { name: "ขยะและความสะอาด", icon: "trash" },
  { name: "ความปลอดภัย", icon: "safety" },
  { name: "สวนและพื้นที่สาธารณะ", icon: "park" },
];

// จุดกลาง: สนามกีฬา ม.กรุงเทพ วิทยาเขตรังสิต (ประมาณ)
const CENTER_LAT = 14.0387;
const CENTER_LNG = 100.6023;

// [หัวข้อ, รายละเอียด, จุดสังเกต, ลำดับหมวด(0-5), ความเร่งด่วน]
type Row = [string, string, string, number, Priority];

const rows: Row[] = [
  ["ถนนเป็นหลุมลึกหน้าโรงเรียน", "หลุมกว้างประมาณ 1 เมตร ฝนตกน้ำขังจนมองไม่เห็น เด็กขี่จักรยานเกือบล้มหลายครั้ง", "ซอยร่มเย็น 2 หน้าโรงเรียนชุมชน", 0, "HIGH"],
  ["ทางเท้าแตกยกตัว", "แผ่นทางเท้ายกสูงเพราะรากไม้ ผู้สูงอายุเดินสะดุดบ่อย", "ถนนสายหลักหน้าร้านขายยา", 0, "MEDIUM"],
  ["ฝาท่อระบายน้ำหาย", "ฝาท่อหายไปทั้งฝา เป็นหลุมเปิดอันตรายมากตอนกลางคืน", "ปากซอยสุขใจ 5", 0, "HIGH"],
  ["เส้นจราจรทางม้าลายจางหาย", "ทางม้าลายหน้าวัดสีลอกจนแทบมองไม่เห็น รถไม่ค่อยหยุดให้คนข้าม", "หน้าวัดในชุมชน", 0, "MEDIUM"],
  ["ลูกระนาดชำรุด", "ลูกระนาดยางหลุดออกครึ่งหนึ่ง มีน็อตโผล่ขึ้นมา รถจักรยานยนต์ยางแตกแล้ว 2 คัน", "ซอยพัฒนา 7", 0, "MEDIUM"],
  ["ถนนทรุดตัวข้างคลอง", "ขอบถนนติดคลองทรุดลงเป็นแนวยาว กลัวจะพังลงคลอง", "ถนนเลียบคลองหมู่ 4", 0, "HIGH"],
  ["ป้ายบอกทางล้ม", "ป้ายชื่อซอยล้มลงมาขวางทางเท้า", "ปากซอยร่วมใจ 1", 0, "LOW"],

  ["ไฟส่องทางดับทั้งซอย", "ไฟถนนดับติดกัน 5 ต้น มืดมากตอนกลางคืน คนกลับบ้านดึกไม่กล้าเดิน", "ซอยสุขใจ 3", 1, "HIGH"],
  ["เสาไฟเอียง", "เสาไฟฟ้าเอียงหลังพายุเมื่อวาน สายไฟหย่อนต่ำ", "หน้าตลาดนัดชุมชน", 1, "HIGH"],
  ["ไฟกะพริบตลอดเวลา", "หลอดไฟส่องทางกะพริบทั้งคืน น่าจะใกล้เสีย", "ทางเข้าสวนสาธารณะ", 1, "LOW"],
  ["สายไฟห้อยระโยงระยาง", "สายสื่อสารขาดห้อยลงมาเกือบถึงพื้น รถสูงเกี่ยวได้", "ซอยพัฒนา 2", 1, "MEDIUM"],
  ["ไฟสนามเด็กเล่นเสีย", "ไฟสปอตไลต์สนามเด็กเล่นไม่ติดมา 2 สัปดาห์", "สนามเด็กเล่นกลางชุมชน", 1, "LOW"],
  ["ไฟฟ้าดับบ่อยช่วงเย็น", "ไฟดับวันละหลายรอบช่วง 6 โมงเย็น เครื่องใช้ไฟฟ้าเสียหาย", "หมู่ 2 ฝั่งตะวันออก", 1, "MEDIUM"],
  ["ไฟถนนเปิดกลางวัน", "ไฟถนนเปิดค้างทั้งวัน เปลืองไฟ", "ถนนสายหลักช่วงหน้าอนามัย", 1, "LOW"],

  ["น้ำท่วมขังหลังฝนตก", "ฝนตกครึ่งชั่วโมงน้ำท่วมสูงถึงข้อเท้า ระบายช้ามาก", "ซอยร่มเย็น 4", 2, "HIGH"],
  ["ท่อประปาแตก", "น้ำพุ่งออกจากท่อใต้ถนนตลอดเวลา ถนนเริ่มเป็นโพรง", "หน้าศาลาประชาคม", 2, "HIGH"],
  ["น้ำประปาขุ่น มีกลิ่น", "น้ำประปาสีเหลืองขุ่น มีกลิ่นคลอรีนแรง เป็นมา 3 วันแล้ว", "หมู่ 3 ทั้งหมู่", 2, "MEDIUM"],
  ["ท่อระบายน้ำอุดตัน", "ท่อมีขยะและโคลนอุด น้ำเน่าส่งกลิ่นเหม็น", "ข้างร้านข้าวแกงปากซอยสุขใจ", 2, "MEDIUM"],
  ["น้ำประปาไม่ไหล", "น้ำไม่ไหลตั้งแต่เช้า ไม่มีประกาศแจ้งล่วงหน้า", "ซอยพัฒนา 9", 2, "HIGH"],
  ["คลองตื้นเขิน", "คลองมีผักตบชวาเต็ม น้ำไม่ไหล หน้าฝนกลัวน้ำล้น", "คลองหลังชุมชน", 2, "MEDIUM"],
  ["มาตรวัดน้ำรั่ว", "มาตรน้ำหน้าบ้านรั่วซึมตลอด", "ซอยร่วมใจ 6", 2, "LOW"],

  ["ขยะล้นถังไม่มีคนเก็บ", "ถังขยะล้นมา 4 วัน สุนัขคุ้ยกระจายเต็มถนน", "จุดทิ้งขยะหน้าตลาด", 3, "HIGH"],
  ["มีคนลักลอบทิ้งขยะ", "มีกองขยะก่อสร้างมาทิ้งที่ที่ดินว่างทุกคืน", "ที่ดินว่างท้ายซอยพัฒนา 5", 3, "MEDIUM"],
  ["ขอถังแยกขยะเพิ่ม", "ชุมชนอยากแยกขยะรีไซเคิลแต่มีถังใบเดียว", "ศาลาประชาคม", 3, "LOW"],
  ["กลิ่นเหม็นจากบ่อขยะ", "กลิ่นเหม็นรุนแรงช่วงเย็น เด็กในบ้านเวียนหัว", "หมู่ 5 ใกล้บ่อขยะเก่า", 3, "MEDIUM"],
  ["ใบไม้อุดรางน้ำทางเท้า", "ใบไม้ทับถมจนน้ำไหลไม่ได้", "ถนนเลียบสวนสาธารณะ", 3, "LOW"],
  ["ซากสัตว์ตายกลางถนน", "มีซากสุนัขถูกรถชนตั้งแต่เมื่อวาน ยังไม่มีคนมาเก็บ", "ถนนสายหลักกิโลเมตรที่ 2", 3, "HIGH"],

  ["สุนัขจรจัดไล่กัดคน", "สุนัขจรจัดฝูงใหญ่ไล่เห่าและกัดนักเรียนแล้ว 1 คน", "ซอยร่มเย็น 1", 4, "HIGH"],
  ["กล้องวงจรปิดเสีย", "กล้อง CCTV ปากซอยไม่ทำงาน มีขโมยรถจักรยานยนต์เมื่อสัปดาห์ก่อน", "ปากซอยสุขใจ", 4, "MEDIUM"],
  ["มีคนมั่วสุมยามดึก", "มีกลุ่มวัยรุ่นมั่วสุมเสียงดังหลังเที่ยงคืนแทบทุกวัน", "ศาลาริมน้ำ", 4, "MEDIUM"],
  ["รถจอดขวางทางรถฉุกเฉิน", "มีรถจอดซ้อนคันในซอยแคบ รถดับเพลิงเข้าไม่ได้", "ซอยพัฒนา 4", 4, "HIGH"],
  ["ต้นไม้ใหญ่กิ่งจะหัก", "กิ่งไม้ใหญ่แห้งยื่นออกมาเหนือถนน ลมแรงอาจหักใส่คน", "หน้าโรงเรียนชุมชน", 4, "HIGH"],
  ["งูเข้าบ้านบ่อย", "พบงูเห่าในบริเวณหลายหลังคาเรือนช่วงหน้าฝน", "หมู่ 4 ติดทุ่งนา", 4, "MEDIUM"],
  ["ราวสะพานข้ามคลองหัก", "ราวกันตกสะพานไม้หักหายไปช่วงหนึ่ง", "สะพานข้ามคลองหลังวัด", 4, "HIGH"],

  ["เครื่องเล่นสนามเด็กชำรุด", "ชิงช้าโซ่ขาดหนึ่งข้าง ไม้กระดานลื่นมีเสี้ยน", "สนามเด็กเล่นกลางชุมชน", 5, "MEDIUM"],
  ["หญ้าในสวนรกสูง", "หญ้าสูงเกินเข่า ไม่มีคนตัดมาเดือนกว่า", "สวนสาธารณะชุมชน", 5, "LOW"],
  ["ม้านั่งในสวนพัง", "ม้านั่งไม้ผุ 3 ตัว นั่งไม่ได้", "ลานออกกำลังกายในสวน", 5, "LOW"],
  ["เครื่องออกกำลังกายเสีย", "เครื่องเดินวงรีหมุนไม่ได้ มีเสียงดัง", "ลานออกกำลังกายในสวน", 5, "LOW"],
  ["ห้องน้ำสาธารณะสกปรก", "ห้องน้ำในสวนไม่มีน้ำ ประตูล็อกไม่ได้", "ห้องน้ำสวนสาธารณะ", 5, "MEDIUM"],
  ["ขอปลูกต้นไม้ริมถนนเพิ่ม", "ถนนร้อนมาก อยากให้มีต้นไม้ให้ร่มเงาบนทางเท้า", "ถนนสายหลักหน้าตลาด", 5, "LOW"],
];

const commentTexts = [
  "เจอเหมือนกันครับ ฝากเร่งด้วย",
  "ตอนนี้ยังเป็นอยู่เลยค่ะ",
  "ขอบคุณที่แจ้งนะครับ ผ่านทุกวันเหมือนกัน",
  "เมื่อวานผ่านไปดู อาการหนักขึ้นกว่าเดิม",
];

// สุ่มแบบกำหนดได้ (รัน seed กี่รอบก็ได้พิกัดเดิม)
function pseudo(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

async function main() {
  console.log("ล้างข้อมูลเก่า...");
  // ลบลูกก่อนแม่ ไม่งั้นติด foreign key
  await prisma.comment.deleteMany();
  await prisma.statusLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("สร้างผู้ใช้...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userIds: number[] = [];
  for (const u of users) {
    const created = await prisma.user.create({ data: { ...u, passwordHash } });
    userIds.push(created.id);
  }
  const staffIds = [userIds[1]!, userIds[2]!];
  const citizenIds = userIds.slice(3);

  console.log("สร้างหมวดหมู่...");
  const catIds: number[] = [];
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    catIds.push(created.id);
  }

  console.log(`สร้างเรื่องแจ้ง ${rows.length} รายการ...`);
  const statuses: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];
  let logCount = 0;
  let commentCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const [title, description, location, catIndex, priority] = rows[i]!;
    const status = statuses[i % 3]!;
    const reporterId = citizenIds[i % citizenIds.length]!;
    const staffId = staffIds[i % 2]!;

    // ไล่วันย้อนหลังให้ดูเหมือนแจ้งคนละวัน
    const createdAt = new Date(Date.now() - (i + 1) * 9 * 60 * 60 * 1000);
    const hour = 60 * 60 * 1000;

    // กระจายหมุดในรัศมีราว 2 กม. (0.018 องศา ≈ 2 กม.)
    const angle = pseudo(i + 1) * Math.PI * 2;
    const dist = 0.003 + pseudo(i + 101) * 0.015;
    const latitude = Number((CENTER_LAT + Math.sin(angle) * dist).toFixed(6));
    const longitude = Number((CENTER_LNG + Math.cos(angle) * dist).toFixed(6));

    // ประวัติสถานะตามลำดับจริง: แจ้ง -> กำลังแก้ -> เสร็จ
    const logs: { fromStatus: ReportStatus | null; toStatus: ReportStatus; note: string; changedById: number; createdAt: Date }[] = [
      { fromStatus: null, toStatus: "PENDING", note: "แจ้งเรื่องเข้าระบบ", changedById: reporterId, createdAt },
    ];
    if (status !== "PENDING") {
      logs.push({
        fromStatus: "PENDING",
        toStatus: "IN_PROGRESS",
        note: "รับเรื่องแล้ว ส่งทีมลงพื้นที่ตรวจสอบ",
        changedById: staffId,
        createdAt: new Date(createdAt.getTime() + 2 * hour),
      });
    }
    if (status === "RESOLVED") {
      logs.push({
        fromStatus: "IN_PROGRESS",
        toStatus: "RESOLVED",
        note: "ดำเนินการแก้ไขเรียบร้อย",
        changedById: staffId,
        createdAt: new Date(createdAt.getTime() + 6 * hour),
      });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        location,
        latitude,
        longitude,
        priority,
        status,
        reporterId,
        categoryId: catIds[catIndex]!,
        createdAt,
        statusLogs: { create: logs },
      },
    });
    logCount += logs.length;

    // ใส่คอมเมนต์ให้บางเรื่อง ทั้งจากประชาชนและเจ้าหน้าที่
    if (i % 3 !== 2) {
      await prisma.comment.create({
        data: {
          reportId: report.id,
          authorId: citizenIds[(i + 2) % citizenIds.length]!,
          message: commentTexts[i % commentTexts.length]!,
          createdAt: new Date(createdAt.getTime() + hour),
        },
      });
      commentCount++;
    }
    if (status !== "PENDING" && i % 2 === 0) {
      await prisma.comment.create({
        data: {
          reportId: report.id,
          authorId: staffId,
          message: "เจ้าหน้าที่รับทราบและกำลังติดตามให้ครับ",
          createdAt: new Date(createdAt.getTime() + 3 * hour),
        },
      });
      commentCount++;
    }
  }

  console.log(
    `เสร็จ: ${users.length} ผู้ใช้, ${categories.length} หมวด, ${rows.length} เรื่อง, ${logCount} ประวัติสถานะ, ${commentCount} ความคิดเห็น`
  );
  console.log(`บัญชีสาธิตทุกบัญชีใช้รหัสผ่าน: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("seed พัง:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
