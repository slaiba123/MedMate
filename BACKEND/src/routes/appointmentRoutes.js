import express from "express";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import { webhookBook } from "../controllers/appointmentController.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// Webhook for voice agent
router.post("/webhook", express.json(), webhookBook);

// Protected appointment endpoints example:
router.use(authMiddleware); // following routes require auth

// fetch single appointment
router.get("/:id", async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ message: "Not found" });
  // role-based access: admin all, doctor only their, patient only their
  const user = req.user;
  if (user.role.includes("admin") || String(appt.doctorId) === String(user._id) || String(appt.patientId) === String(user._id)) {
    return res.json(appt);
  }
  return res.status(403).json({ message: "Forbidden" });
});

export default router;
