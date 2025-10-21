import express from "express";
import { 
    alldoctors,
    browseDoctors, 
    getDoctorSlots, 
    bookAppointment,
  } from "../controllers/patientController.js";
  

const router = express.Router();
router.get("/doctors", alldoctors);
router.get("/doctors/browse", browseDoctors);
router.get("/doctors/:id/slots", getDoctorSlots);
router.post("/appointments", bookAppointment); // public booking + webhook also posts here
export default router;
