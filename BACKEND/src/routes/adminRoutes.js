import express from "express";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import { listDoctors, addDoctor, disableDoctor, enableDoctor, updateDoctor, deleteDoctor, addCity,getCities} from "../controllers/adminController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin"])); 

router.get("/doctors", listDoctors);
router.post("/doctors/add", upload.single("image"), addDoctor);
router.post("/addcity", addCity);
router.get("/cities", getCities);
router.patch("/doctors/:doctorId/disable", disableDoctor);
router.patch("/doctors/:doctorId/enable", enableDoctor);
router.delete("/doctors/:doctorId/delete", deleteDoctor);
router.put("/doctors/:doctorId/update", updateDoctor);

export default router;
