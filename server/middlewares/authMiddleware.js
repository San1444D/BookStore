// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export const requireAuth = (allowedRoles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("JWT payload:", decoded);
      req.user = decoded; // { id, role, iat, exp }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }
  };
};
