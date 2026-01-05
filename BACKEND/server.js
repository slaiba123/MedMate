// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import bodyParser from "body-parser";
// // import cookieParser from "cookie-parser";
// // import connectDB from "./src/config/db.js";

// // dotenv.config();

// // // Route files
// // import authRoutes from "./src/routes/authRoutes.js";
// // import adminRoutes from "./src/routes/adminRoutes.js";
// // import doctorRoutes from "./src/routes/doctorRoutes.js";
// // import patientRoutes from "./src/routes/patientRoutes.js";
// // import vapiFunctionRoutes from "./src/routes/vapiFunctionRoutes.js";



// // // Init app
// // const app = express();
// // const PORT = process.env.PORT || 4000;

// // // Middleware
// // app.use(cors({
// //   origin: [
// //     process.env.CLIENT_URL || 'http://localhost:3000',
// //     'https://earl-unpronounceable-willette.ngrok-free.dev'
// //   ],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));
// // app.use(cookieParser());
// // app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded({ extended: true }));

// // // Connect DB
// // connectDB();

// // // Routes
// // app.get("/", (req, res) => {
// //   res.send("Welcome to the Healthcare Appointment System API 🚀");
// // });

// // app.use("/api/auth", authRoutes);
// // app.use("/api/admin", adminRoutes);
// // app.use("/api/doctors", doctorRoutes);
// // app.use("/api/patient", patientRoutes);

// // // FIX: Mount the Vapi routes properly
// // app.use("/api/vapi", vapiFunctionRoutes);

// // // Start Server
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running at http://localhost:${PORT}`);
// // });


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import connectDB from "./src/config/db.js";

// dotenv.config();

// // Route files
// import authRoutes from "./src/routes/authRoutes.js";
// import adminRoutes from "./src/routes/adminRoutes.js";
// import doctorRoutes from "./src/routes/doctorRoutes.js";
// import patientRoutes from "./src/routes/patientRoutes.js";
// import vapiFunctionRoutes from "./src/routes/vapiFunctionRoutes.js";

// // Init app
// const app = express();
// const PORT = process.env.PORT || 4000;

// // Middleware
// app.use(cors({
//   origin: [
//     process.env.CLIENT_URL || 'http://localhost:3000',
//     'https://earl-unpronounceable-willette.ngrok-free.dev'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Connect DB
// connectDB();

// // Routes
// app.get("/", (req, res) => {
//   res.send("Welcome to the Healthcare Appointment System API 🚀");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/patient", patientRoutes);
// app.use("/api/vapi", vapiFunctionRoutes);

// // Start Server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";

dotenv.config();

// Route files
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import doctorRoutes from "./src/routes/doctorRoutes.js";
import patientRoutes from "./src/routes/patientRoutes.js";
import vapiFunctionRoutes from "./src/routes/vapiFunctionRoutes.js";

// Init app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware - FIXED CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://earl-unpronounceable-willette.ngrok-free.dev',
    'https://med-mate-wc2l.vercel.app', // ADD YOUR VERCEL URL
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect DB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Healthcare Appointment System API 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/vapi", vapiFunctionRoutes);

// Start Server - FIXED console.log
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`); // Use parentheses, not backticks
});