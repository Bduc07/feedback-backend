// No need for JWT verification anymore
const protect = (req, res, next) => {
  // If you still want some form of protection, you can check if the user is logged in based on a session or specific headers.
  // Here I'm assuming we're not using JWT anymore, so the protection could be removed or replaced with other checks (like session-based authentication).
  if (!req.headers['authorization']) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  // If needed, you can add additional logic to check if the user is logged in based on session or cookies.
  // In case of no JWT, this could be checked against something else.

  next(); // Proceed to the next middleware or route handler
};

// Adjusted `authorizeRoles` to simply work with some form of role authorization from the request or session
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Since we're no longer using JWT, we assume roles are stored in some way on the request object (e.g., from session, database, or predefined roles)
    // You can modify this to use your own logic to attach roles to the `req` object

    if (!req.user?.role) {
      return res.status(403).json({ error: 'No role assigned' });
    }

    const userRole = req.user.role;  // We assume the role is now passed in the request
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
