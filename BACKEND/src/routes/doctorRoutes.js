// routes/doctorRoutes.js
import express from 'express';
import {
  setAvailability,
  getAvailability,
  getMyAppointments,
  markAppointmentStatus,
  deleteAppointment,
  getDoctorStats
} from "../controllers/doctorController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Apply auth to ALL routes
router.use(authMiddleware);

// Availability routes
router.post('/:doctorId/availability', roleMiddleware(['doctor']), setAvailability);
router.get('/:doctorId/availability', roleMiddleware(['doctor']), getAvailability);

// Appointment routes
router.get('/:doctorId/appointments', roleMiddleware(['doctor']), getMyAppointments);
router.patch('/appointments/:id/status', roleMiddleware(['doctor']), markAppointmentStatus);
router.delete('/appointments/:id', roleMiddleware(['doctor']), deleteAppointment);

// Stats route
router.get('/:doctorId/stats', roleMiddleware(['doctor']), getDoctorStats);

export default router;