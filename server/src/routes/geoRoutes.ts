import { Router } from "express";
import { getAirQuality, reverseGeocode, searchPlaces } from "../controllers/geoController.js";

const router = Router();

// เรียก API ภายนอกผ่าน server (ไม่ต้องล็อกอิน)
router.get("/geo/reverse", reverseGeocode);
router.get("/geo/search", searchPlaces);
router.get("/geo/air", getAirQuality);

export default router;
