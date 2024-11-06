export const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
      // Check if user roles are available from the decoded token
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Access denied: roles not found' });
      }
  
      // Check if the user has at least one of the allowed roles
      const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
  
      if (!hasRole) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
  
      next();
    };
  };
  