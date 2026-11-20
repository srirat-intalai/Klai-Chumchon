/// <reference types="vite/client" />

// ประกาศ type ของตัวแปร .env ฝั่งหน้าบ้าน ไม่งั้น TypeScript จะไม่รู้ชนิดข้อมูล
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
