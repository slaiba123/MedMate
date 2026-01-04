// controllers/patientController.js - COMPLETE WITH ALL EXPORTS
import User from "../models/User.js";
import DoctorDetails from "../models/doctorDetails.js";
import Appointment from "../models/Appointment.js";
import { generateSlotsForDate } from "../utils/slots.js";
import { sendEmail } from "../utils/mail.js";
import { format, startOfDay, endOfDay } from "date-fns";
import { zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";

const PKT = "Asia/Karachi";

// ============================================
// EXPORTED FUNCTIONS
// ============================================

export const browseDoctors = async (req, res) => {
  try {
    const { specialization, city, name } = req.query;
    const detailsQuery = {};
    if (specialization) detailsQuery.specialization = specialization;
    if (city) detailsQuery.city = city;

    const details = await DoctorDetails.find(detailsQuery);
    const doctors = await Promise.all(details.map(async d => {
      const user = await User.findById(d.userId).select("-password");
      return { user, details: d };
    }));
    
    const filtered = name 
      ? doctors.filter(d => (d.user.name || "").toLowerCase().includes(name.toLowerCase())) 
      : doctors;
    
    res.json(filtered);
  } catch (err) {
    console.error("Error in browseDoctors:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date required" });
    }

    const targetDate = new Date(`${date}T00:00:00+05:00`);

    const doctorDetails = await DoctorDetails.findOne({ userId: id });
    if (!doctorDetails || !doctorDetails.availability) {
      return res.json({ date, slots: [] });
    }

    const allSlots = generateSlotsForDate(doctorDetails.availability, targetDate);

    const pktStart = startOfDay(targetDate);
    const pktEnd = endOfDay(targetDate);
    const dayStartUtc = zonedTimeToUtc(pktStart, PKT);
    const dayEndUtc = zonedTimeToUtc(pktEnd, PKT);

    const appts = await Appointment.find({
      doctorId: id,
      startTime: { $gte: dayStartUtc, $lte: dayEndUtc },
      status: { $ne: "cancelled" }
    });

    const bookedSet = new Set(
      appts.map(a => formatInTimeZone(a.startTime, PKT, "HH:mm"))
    );

    const freeSlots = allSlots.filter(s => !bookedSet.has(s));

    return res.json({ date, slots: freeSlots });
  } catch (err) {
    console.error("Error in getDoctorSlots:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { 
      doctorId,  
      patientEmail, 
      patientName,
      patientPhone,
      startTime, 
      endTime, 
      symptoms, 
      consultationFee, 
      notes 
    } = req.body;

    console.log('📝 Booking appointment:', {
      doctorId,
      patientEmail,
      patientName,
      patientPhone,
      startTime,
      endTime
    });

    if (!doctorId || !startTime || !endTime || (!patientPhone&&!patientEmail)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      startTime: start,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: "This time slot is already booked. Please choose another slot." 
      });
    }

    const appointmentDoc = {
      doctorId,
      patientEmail: patientEmail || undefined,
      patientName: patientName || undefined,
      patientPhone: patientPhone || undefined,
      startTime: start,
      endTime: end,
      status: "booked",
      symptoms: symptoms || undefined,
      consultationFee: consultationFee || 0,
      notes: notes || undefined
    };

    const appt = await Appointment.create(appointmentDoc);

    console.log('✅ Appointment created:', appt._id);

    setImmediate(async () => {
      try {
        const doctorUser = await User.findById(doctorId);
        
        let recipientEmail = patientEmail;
        let recipientName = patientName || 'Patient';
        
        if (!recipientEmail && patientId) {
          const patientUser = await User.findById(patientId);
          recipientEmail = patientUser?.email;
          recipientName = patientUser?.name || recipientName;
        }

        if (recipientEmail && doctorUser) {
          const formattedDate = formatInTimeZone(start, PKT, "EEEE, MMMM do, yyyy");
          const formattedStartTime = formatInTimeZone(start, PKT, "h:mm a");
          const formattedEndTime = formatInTimeZone(end, PKT, "h:mm a");
          const timeSlot = `${formattedStartTime} - ${formattedEndTime}`;

          await sendEmail({
            to: recipientEmail,
            subject: 'Appointment Confirmation - Dr. ' + doctorUser.name,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50; text-align: center;">Appointment Confirmed!</h2>
                
                <p>Dear ${recipientName},</p>
                <p>Your appointment has been successfully confirmed!</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
                  <p><strong>Doctor:</strong> Dr. ${doctorUser.name}</p>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${timeSlot}</p>
                  ${symptoms ? `<p><strong>Symptoms:</strong> ${symptoms}</p>` : ''}
                  ${consultationFee ? `<p><strong>Consultation Fee:</strong> PKR ${consultationFee}</p>` : ''}
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #1976d2; margin-top: 0;">Important Notes:</h4>
                  <ul style="color: #333;">
                    <li>Please arrive 15 minutes before your scheduled appointment</li>
                    <li>Bring a valid ID and any relevant medical documents</li>
                    <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                  </ul>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                  <strong>Thank you for using our appointment booking system!</strong><br>
                  <span style="color: #666;">Healthcare Appointment System</span>
                </p>
              </div>
            `
          });
          
          console.log('✅ Confirmation email sent to:', recipientEmail);
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }
    });

    res.status(201).json({ 
      message: "Appointment booked successfully", 
      appointment: {
        id: appt._id,
        doctorId: appt.doctorId,
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status
      }
    });

  } catch (err) {
    console.error('❌ Booking error:', err);
    
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "Slot already booked. Please choose another slot." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to book appointment", 
      error: err.message 
    });
  }
};

export const alldoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    const query = { role: "doctor" };

    if (name) query.name = new RegExp(name, "i");
    if (specialization) query.specialization = specialization;

    const doctors = await User.find(query).select("-password").lean();

    const results = await Promise.all(
      doctors.map(async (doc) => {
        const details = await DoctorDetails.findOne({ userId: doc._id })
          .populate("cityId", "name")
          .lean();

        return {
          ...doc,
          details: {
            ...details,
            city: details?.cityId?.name || "Unknown",
          },
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ message: "Server Error" });
  }
};