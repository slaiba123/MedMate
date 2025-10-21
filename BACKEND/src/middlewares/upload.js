import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doctors",  // Images will go inside "doctors" folder
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export const upload = multer({ storage });


