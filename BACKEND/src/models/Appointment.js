// import mongoose from "mongoose";

// const appointmentSchema = new mongoose.Schema(
//   {
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     startTime: { type: Date, required: true }, // exact start datetime
//     endTime: { type: Date, required: true },   // exact end datetime
//     status: {
//       type: String,
//       enum: ["booked", "completed", "cancelled", "missed"],
//       default: "booked",
//     },
//     symptoms: { type: String }, // reason for visit
//     consultationFee: { type: Number }, // snapshot at booking time
//   },
//   { timestamps: true }
// );

// // Optional: Prevent double booking (doctor + same startTime)
// appointmentSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });

// export default mongoose.model("Appointment", appointmentSchema);

import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Doctor reference (they do login)
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Patient info stored directly (no login needed)
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    patientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    patientPhone: {
      type: String,
      trim: true
    },
    
    // Appointment timing
    startTime: { 
      type: Date, 
      required: true 
    },
    endTime: { 
      type: Date, 
      required: true 
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "booked", "completed", "cancelled", "missed"],
      default: "pending",
    },
    
    // Additional info
    symptoms: { 
      type: String 
    },
    reason: {
      type: String
    },
    consultationFee: { 
      type: Number 
    },
  },
  { timestamps: true }
);

// Prevent double booking for same doctor at same time
appointmentSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });

// Optional: Index for finding all appointments for a patient email
appointmentSchema.index({ patientEmail: 1 });

export default mongoose.model("Appointment", appointmentSchema);