// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import { sendEmail } from "../utils/mail.js";

/**
 * Webhook for voice agent to POST booking payload
 * Expected to be similar to front-end booking body.
 */
export const webhookBook = async (req, res) => {
  try {
    // optional: verify provider signature here
    const payload = req.body;
    // reuse patientController.bookAppointment logic or call service layer
    // For brevity, assume payload has doctorId, appointmentDate, slotTime, patientName, patientEmail
    const { doctorId, appointmentDate, slotTime, patientName, patientEmail } = payload;
    // simple validation
    if (!doctorId || !appointmentDate || !slotTime || !patientEmail) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    try {
      const appt = await Appointment.create({
        doctorId,
        appointmentDate: new Date(appointmentDate),
        slotTime,
        patientName,
        patientEmail,
        status: "booked"
      });

      // send email
      await sendEmail({
        to: patientEmail,
        subject: "Appointment confirmation (voice)",
        html: `<p>Your appointment is confirmed for ${appointmentDate} at ${slotTime}.</p>`
      });

      return res.json({ success: true, appointment: appt });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: "Slot already booked" });
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Webhook error" });
  }
};
