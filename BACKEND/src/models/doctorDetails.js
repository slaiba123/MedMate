import mongoose from "mongoose";

const doctorDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true },
    education: { type: String, required: true },
    consultationFee: { type: Number, required: true },
    experience: { type: Number, required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    image: { type: String },
    enabled: { type: Boolean, default: true },
    availability: [
      {
        dayOfWeek: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        startTime: { type: Number, required: true }, // e.g., 540 for 9:00
        endTime: { type: Number, required: true },   // e.g., 1020 for 17:00
      },
    ],
  },
  { timestamps: true }
);

doctorDetailsSchema.index({ cityId: 1, specialization: 1, enabled: 1 });

export default mongoose.models.DoctorDetails ||
  mongoose.model("DoctorDetails", doctorDetailsSchema);