// import User from "../models/User.js";
// import RefreshToken from "../models/RefreshToken.js";
// import bcrypt from "bcryptjs";
// import {
//   signAccessToken,
//   signRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
// } from "../utils/jwt.js";

// // ========================== REGISTER ==========================
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "patient", // Default to patient if not specified
//     });

//     // Create tokens
//     const accessToken = signAccessToken(user);
//     const { token: refreshToken, expiresAt } = signRefreshToken(user);

//     // Save refresh token in DB
//     await RefreshToken.create({
//       token: refreshToken,
//       userId: user._id,
//       expiresAt,
//     });

//     // Set tokens in cookies
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite:"none",
//       maxAge: 15 * 60 * 1000, // 15 mins
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     res.status(201).json({
//       message: "Registration successful",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ========================== LOGIN ==========================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(401).json({ message: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid email or password" });

//     // create tokens
//     const accessToken = signAccessToken(user);
//     const { token: refreshToken, expiresAt } = signRefreshToken(user);

//     // save refresh token in DB
//     await RefreshToken.create({
//       token: refreshToken,
//       userId: user._id,
//       expiresAt,
//     });

//     // set tokens in cookies (httpOnly for security)
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 15 * 60 * 1000, // 15 mins
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // ====================== UPDATE PASSWORD ======================
// export const updatePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Get user from middleware
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Verify current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Current password is incorrect" });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password
//     user.password = hashedPassword;
//     await user.save();

//     // Invalidate all refresh tokens (important security step)
//     await RefreshToken.deleteMany({ userId: user._id });

//     // Clear cookies to force re-login
//     res.clearCookie("accessToken");
//     res.clearCookie("refreshToken");

//     res.json({ message: "Password updated successfully. Please login again." });
//   } catch (err) {
//     console.error("Update password error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ========================== ME ==========================
// export const me = async (req, res) => {
//   try {
//     const token = req.cookies.accessToken;
//     if (!token) return res.status(401).json({ message: "Not logged in" });

//     const decoded = verifyAccessToken(token);
//     if (!decoded) return res.status(403).json({ message: "Invalid token" });

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ user });
//   } catch (err) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

// // ========================== REFRESH ==========================
// export const refresh = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken)
//       return res.status(401).json({ message: "No refresh token" });

//     const storedToken = await RefreshToken.findOne({ token: refreshToken });
//     if (!storedToken)
//       return res.status(403).json({ message: "Invalid refresh token" });

//     const decoded = verifyRefreshToken(refreshToken);
//     if (!decoded)
//       return res.status(403).json({ message: "Invalid refresh token" });

//     const user = await User.findById(decoded.id);
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     // rotate refresh token
//     await RefreshToken.deleteOne({ token: refreshToken });
//     const accessToken = signAccessToken(user);
//     const { token: newRefreshToken, expiresAt } = signRefreshToken(user);
//     await RefreshToken.create({
//       token: newRefreshToken,
//       userId: user._id,
//       expiresAt,
//     });

//     // set new cookies
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.json({ message: "Token refreshed" });
//   } catch (err) {
//     console.error("Refresh error:", err);
//     res.status(403).json({ message: "Invalid refresh token" });
//   }
// };

// // ========================== LOGOUT ==========================
// export const logout = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (refreshToken) {
//       await RefreshToken.deleteOne({ token: refreshToken });
//     }

//     res.clearCookie("refreshToken");
//     res.clearCookie("accessToken");

//     res.json({ message: "Logged out successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

/**
 * =========================
 * COOKIE CONFIG (IMPORTANT)
 * =========================
 * SameSite=None is REQUIRED for cross-site (Next.js frontend + Express backend)
 * Secure=true is REQUIRED when SameSite=None (browser rule)
 */
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

/* ========================= REGISTER ========================= */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "patient",
    });

    const accessToken = signAccessToken(user);
    const { token: refreshToken, expiresAt } = signRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user);
    const { token: refreshToken, expiresAt } = signRefreshToken(user);

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ====================== UPDATE PASSWORD ====================== */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // revoke ALL refresh tokens
    await RefreshToken.deleteMany({ userId: user._id });

    // force re-login
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.json({
      message: "Password updated successfully. Please login again.",
    });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========================== ME ========================= */
export const me = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/* ========================== REFRESH ========================= */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    const newAccessToken = signAccessToken(user);
    const { token: newRefreshToken, expiresAt } = signRefreshToken(user);

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt,
    });

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

/* ========================== LOGOUT ========================= */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.json({ message: "Logged out successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
