import type { Role } from "@prisma/client";

// ให้ req.user มี type หลังผ่าน middleware requireAuth
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
    }
  }
}

export {};
