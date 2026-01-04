// controllers/adminController.js
import User from "../models/User.js";
import DoctorDetails from "../models/doctorDetails.js";
import City from "../models/City.js";
import bcrypt from "bcryptjs";

export const listDoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    
    // Build user query
    const userQuery = { role: "doctor" };
    if (name) {
      userQuery.name = new RegExp(name, "i");
    }

    // Get all doctors first
    const doctors = await User.find(userQuery).select("-password");

    // Get their details and filter by specialization if needed
    const results = await Promise.all(
      doctors.map(async (doc) => {
        const details = await DoctorDetails.findOne({ userId: doc._id });
        return { ...doc.toObject(), details };
      })
    );

    // Filter by specialization if provided (since it's in DoctorDetails)
    let filteredResults = results;
    if (specialization && specialization !== 'all') {
      filteredResults = results.filter(doctor => 
        doctor.details?.specialization === specialization
      );
    }

    res.json(filteredResults);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

// Add Doctor
// export const addDoctor = async (req, res) => {
//   try {
//     const { name, email, password, specialization, education, consultationFee, city } = req.body;

//     // 1. Check duplicate email
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email exists" });

//     // 2. Hash password
//     const hashed = await bcrypt.hash(password, 10);

//     // 3. Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//       role: ["doctor"],
//     });

//  // 4. Find city by name (case-insensitive, accent-insensitive)
// const cityDoc = await City.findOne({
//   name: city.trim(),
// }).collation({ locale: "en", strength: 2 });

// if (!cityDoc) {
//   // delete created user before returning
//   await User.findByIdAndDelete(user._id);
//   return res.status(400).json({ message: `City '${city}' not found` });
// }
// console.log("File received:", req.file);

//     // 5. Handle image (multer-storage-cloudinary provides Cloudinary URL in req.file.path)
//     const imageUrl = req.file ? req.file.path : null;

//     // 6. Create doctor details
//     try {
//       await DoctorDetails.create({
//         userId: user._id,
//         specialization,
//         education,
//         consultationFee,
//         cityId: cityDoc._id,
//         availability: [],
//         image: imageUrl,
//       });
//     } catch (err) {
//       // delete created user if doctor details fail
//       await User.findByIdAndDelete(user._id);
//       throw err;
//     }

//     res.status(201).json({ message: "Doctor added", doctorId: user._id });
//   } catch (err) {
//     console.error("Error adding doctor:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Add Doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, education, consultationFee, cityId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !specialization || !education || !consultationFee || !cityId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("📝 Received doctor data:", {
      name, email, specialization, education, consultationFee, cityId
    });

    // 1. Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // 2. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: ["doctor"],
    });

    // 4. Find city by ID (more reliable than name)
    const cityDoc = await City.findById(cityId);
    if (!cityDoc) {
      // Delete created user before returning
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ message: `City with ID '${cityId}' not found` });
    }

    console.log("📁 File received:", req.file);

    // 5. Handle image (multer-storage-cloudinary provides Cloudinary URL in req.file.path)
    const imageUrl = req.file ? req.file.path : null;

    // 6. Create doctor details
    try {
      await DoctorDetails.create({
        userId: user._id,
        specialization: specialization.trim(),
        education: education.trim(),
        consultationFee: Number(consultationFee),
        cityId: cityDoc._id,
        availability: [],
        image: imageUrl,
        enabled: true, // Default to enabled
      });
    } catch (err) {
      // Delete created user if doctor details fail
      await User.findByIdAndDelete(user._id);
      console.error("Error creating doctor details:", err);
      throw err;
    }

    res.status(201).json({ message: "Doctor added successfully", doctorId: user._id });
  } catch (err) {
    console.error("Error adding doctor:", err);
    
    // More specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error: " + err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    res.status(500).json({ message: "Server error while adding doctor" });
  }
};

export const disableDoctor = async (req, res) => {
  try {
    const {doctorId } = req.params;

    const doctor = await DoctorDetails.findOneAndUpdate(
      { userId: doctorId },   // explicitly match on userId
      { enabled: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor disabled", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const enableDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await DoctorDetails.findOneAndUpdate(
      { userId: doctorId },   // explicitly match on userId
      { enabled: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor enabled", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update doctor account (admin only)


// Update your backend updateDoctor function to handle all fields
export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, email, specialization, education, consultationFee, cityId, enabled } = req.body;

    // Update user info
    const user = await User.findByIdAndUpdate(
      doctorId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Doctor not found" });

    // Update doctor details with all fields
    const updateData = { specialization };
    
    // Add optional fields if provided
    if (education !== undefined) updateData.education = education;
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
    if (cityId !== undefined) updateData.cityId = cityId;
    if (enabled !== undefined) updateData.enabled = enabled;

    const details = await DoctorDetails.findOneAndUpdate(
      { userId: doctorId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({ ...user.toObject(), details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete doctor account (admin only)
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const user = await User.findByIdAndDelete(doctorId);
    if (!user) return res.status(404).json({ message: "Doctor not found" });

    await DoctorDetails.findOneAndDelete({ userId: doctorId });

    res.json({ message: "Doctor account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//add city
export const addCity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "City name is required" });
    }

    // Check if city already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: "City already exists" });
    }

    // Create and save new city
    const city = new City({ name });
    await city.save();

    res.status(201).json({ message: "City added successfully", city });
  } catch (error) {
    console.error("Error adding city:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCities = async (req, res) => {
  try {
    // Fetch all cities, sorted alphabetically
    const cities = await City.find({})
      .select('_id name country')
      .sort({ name: 1 })
      .lean();
   
    console.log(`📍 Fetched ${cities.length} cities`);
    res.json(cities);
  } catch (error) {
    console.error('❌ Error fetching cities:', error);
    res.status(500).json({ message: 'Failed to fetch cities', error: error.message });
  }
};