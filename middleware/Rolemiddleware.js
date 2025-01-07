import jwt from 'jsonwebtoken';
import User  from '../models/user.model.js';  // Import User model for accessing user data

// Middleware to verify user role
export function verifyRole(requiredRoles) {
  return async (req, res, next) => {
    try {
      // Get token from request headers (assuming it's a Bearer token)
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key

      // Find the user by ID
      const user = await User.findById(decoded.userId);  // Assuming token contains userId

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user has one of the required roles
      if (!requiredRoles.some(role => user.roles.includes(role))) {
        return res.status(403).json({ message: 'Access denied: Insufficient role' });
      }

      // Attach the user to the request object for use in the route handler
      req.user = user;
      next();  // Allow the request to proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
