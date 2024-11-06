import { ApiError } from "../utils/ApiErr.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const authMiddleware = (requiredRoles = []) => {
    return async (req, res, next) => {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
  
        req.user = user;
  
        if (requiredRoles.length && !requiredRoles.some(role => user.roles.includes(role))) {
          return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
  
        next();
      } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
      }
    };
  };

export const authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
}