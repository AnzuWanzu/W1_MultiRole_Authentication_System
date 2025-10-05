export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  try {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Not authenticated" });
    if (!allowedRoles.includes(role)) return res.status(403).json({ message: "Forbidden" });
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};
