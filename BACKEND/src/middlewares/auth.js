import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    console.error("❌ Token verification failed");
    return res.status(403).json({ message: "Invalid token" });
  }

  req.user = decoded;
  console.log("🔑 Decoded token:", decoded);
  next();
};

// Keep your roleMiddleware exactly as is - it's perfect!
export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    console.log("👤 User roles:", req.user.role);
    console.log("🔍 Required roles:", roles);
    
    if (!req.user.role || !Array.isArray(req.user.role)) {
      return res.status(403).json({ message: "Access denied - no roles" });
    }
    
    const hasRequiredRole = roles.some(requiredRole => 
      req.user.role.includes(requiredRole)
    );
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: "Access denied - insufficient permissions" });
    }
    
    next();
  };
};