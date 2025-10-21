// utils/jwt.js
import jwt from "jsonwebtoken";

// ========================== SIGN ACCESS TOKEN ==========================
export const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },   // payload
    process.env.JWT_SECRET,              // secret for access tokens
    { expiresIn: "15m" }                 // short lifespan
  );
};

// ========================== SIGN REFRESH TOKEN ==========================
export const signRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user._id },                     // smaller payload
    process.env.JWT_REFRESH_SECRET,       // separate secret for refresh tokens
    { expiresIn: "7d" }                   // long lifespan
  );

  // decode expiry timestamp from JWT
  const { exp } = jwt.decode(token);
  return { token, expiresAt: new Date(exp * 1000) };
};

// ========================== VERIFY ACCESS TOKEN ==========================
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // invalid or expired
  }
};

// ========================== VERIFY REFRESH TOKEN ==========================
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null; // invalid or expired
  }
};
