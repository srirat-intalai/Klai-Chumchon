// จำกัดการล็อกอินผิด: ผิดได้ 5 ครั้งใน 15 นาที (นับแยกตาม IP + อีเมล)
// เก็บใน Map ธรรมดาในหน่วยความจำ รีสตาร์ท server แล้วตัวนับเริ่มใหม่ ซึ่งพอสำหรับงานนี้

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Attempt {
  count: number;
  firstAt: number; // เวลาที่ผิดครั้งแรกของรอบนี้
}

const attempts = new Map<string, Attempt>();

function makeKey(ip: string, email: string): string {
  return ip + "|" + email.toLowerCase();
}

// เหลือเวลาอีกกี่นาทีถึงจะลองใหม่ได้ (0 = ลองได้เลย)
export function minutesLocked(ip: string, email: string): number {
  const a = attempts.get(makeKey(ip, email));
  if (!a) return 0;

  const passed = Date.now() - a.firstAt;
  if (passed > WINDOW_MS) {
    attempts.delete(makeKey(ip, email));
    return 0;
  }
  if (a.count < MAX_FAILS) return 0;
  return Math.ceil((WINDOW_MS - passed) / 60000);
}

export function recordFail(ip: string, email: string) {
  const key = makeKey(ip, email);
  const a = attempts.get(key);
  if (!a || Date.now() - a.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
  } else {
    a.count++;
  }
}

export function clearFails(ip: string, email: string) {
  attempts.delete(makeKey(ip, email));
}
