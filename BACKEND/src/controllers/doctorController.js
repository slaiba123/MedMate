// controllers/doctorController.js
import Appointment from "../models/Appointment.js";
import DoctorDetails from "../models/DoctorDetails.js";
import { startOfDay, endOfDay } from "date-fns";
import moment from "moment-timezone";

// =======================
// Doctor Sets Availability
// =======================
export const setAvailability = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { availability } = req.body;
    
    console.log('🕐 Setting availability for doctor:', doctorId);
    
    const doctor = await DoctorDetails.findOne({ userId: doctorId });
    if (!doctor) {
      console.error('❌ Doctor profile not found for userId:', doctorId);
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    doctor.availability = availability.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: parseInt(slot.startTime, 10),
      endTime: parseInt(slot.endTime, 10),
    }));
    
    await doctor.save();
    console.log('✅ Availability saved successfully');
    res.json({ message: "Availability updated", availability: doctor.availability });
  } catch (err) {
    console.error('❌ Error in setAvailability:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get Doctor's Availability
// =======================
export const getAvailability = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    console.log('🕐 Getting availability for doctor:', doctorId);
    
    const doctor = await DoctorDetails.findOne({ userId: doctorId });
    if (!doctor) {
      console.error('❌ Doctor profile not found for userId:', doctorId);
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    console.log('✅ Found availability:', doctor.availability?.length || 0, 'slots');
    res.json({ availability: doctor.availability || [] });
  } catch (err) {
    console.error('❌ Error in getAvailability:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get My Appointments - With Patient Info Fields
// =======================
export const getMyAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    console.log('📅 Getting appointments for doctor:', doctorId);
    
    const appointments = await Appointment.find({ doctorId })
      .sort({ startTime: 1 });
    
    console.log('✅ Found appointments:', appointments.length);
    
    if (appointments.length === 0) {
      console.log('ℹ️ No appointments found for this doctor');
      return res.json([]);
    }
    
    // Convert UTC → PKT and format patient data for frontend
    const convertedAppointments = appointments.map((appt) => {
      return {
        _id: appt._id,
        doctorId: appt.doctorId,
        startTime: moment(appt.startTime).tz("Asia/Karachi").format(),
        endTime: moment(appt.endTime).tz("Asia/Karachi").format(),
        status: appt.status,
        reason: appt.reason || appt.symptoms,
        // Format patient data to match frontend expectations
        patientId: {
          _id: appt._id, // Use appointment ID as placeholder
          name: appt.patientName,
          email: appt.patientEmail,
          phone: appt.patientPhone
        }
      };
    });
    
    console.log('✅ Returning', convertedAppointments.length, 'appointments');
    res.json(convertedAppointments);
  } catch (err) {
    console.error('❌ Error in getMyAppointments:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Mark Appointment Status
// =======================
export const markAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('📝 Updating appointment status:', id, 'to', status);
    
    const appt = await Appointment.findById(id);
    if (!appt) {
      console.error('❌ Appointment not found:', id);
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'booked', 'completed', 'cancelled', 'missed'];
    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status:', status);
      return res.status(400).json({ message: "Invalid status" });
    }
    
    appt.status = status;
    await appt.save();
    
    console.log('✅ Appointment status updated to:', status);
    res.json({ message: "Appointment status updated", appointment: appt });
  } catch (err) {
    console.error('❌ Error in markAppointmentStatus:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Delete Appointment
// =======================
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting appointment:', id);
    
    const appt = await Appointment.findById(id);
    if (!appt) {
      console.error('❌ Appointment not found:', id);
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    await Appointment.findByIdAndDelete(id);
    
    console.log('✅ Appointment deleted successfully');
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error('❌ Error in deleteAppointment:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get Doctor Stats (Dashboard)
// =======================
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    console.log('📊 Getting stats for doctor:', doctorId);
    
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    // Total appointments
    const totalAppointments = await Appointment.countDocuments({ doctorId });
    console.log('📊 Total appointments:', totalAppointments);
    
    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      startTime: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });
    console.log('📊 Today appointments:', todayAppointments);
    
    // Completed vs Missed
    const completedAppointments = await Appointment.countDocuments({
      doctorId,
      status: "completed",
    });
    const missedAppointments = await Appointment.countDocuments({
      doctorId,
      status: "missed",
    });
    console.log('📊 Completed:', completedAppointments, 'Missed:', missedAppointments);
    
    // Next scheduled appointment
    const nextAppointment = await Appointment.findOne({
      doctorId,
      startTime: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'booked'] }
    })
      .sort({ startTime: 1 });
    
    // Format next appointment for frontend
    let nextApptFormatted = null;
    if (nextAppointment) {
      nextApptFormatted = {
        startTime: nextAppointment.startTime,
        endTime: nextAppointment.endTime,
        patientId: {
          name: nextAppointment.patientName
        }
      };
    }
    
    console.log('📊 Next appointment:', nextAppointment ? 'Found' : 'None');
    
    const stats = {
      totalAppointments,
      todayAppointments,
      completedAppointments,
      missedAppointments,
      nextAppointment: nextApptFormatted,
    };
    
    console.log('✅ Returning stats');
    res.json(stats);
  } catch (err) {
    console.error('❌ Error in getDoctorStats:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};