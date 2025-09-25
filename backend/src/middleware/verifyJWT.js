import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../utils/constants.js";

export const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME] || req.headers["authorization"]?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
