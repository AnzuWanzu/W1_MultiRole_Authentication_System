import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getProfile,
  changePassword,
  setUserRole,
  userLogin,
  logout,
  updateUser,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../utils/tokenManager.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

import {
  createUserValidator,
  deleteUserValidator,
  loginValidator,
  validate,
} from "../utils/validator.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.get("/:id", getUserById);
// authenticated routes
userRoutes.get("/me", verifyJWT, getProfile);
userRoutes.post("/changePassword", verifyJWT, changePassword);
userRoutes.post("/createUser", validate(createUserValidator), createUser);
userRoutes.post("/login", validate(loginValidator), userLogin);
userRoutes.delete("/deleteUser/:id", verifyJWT, validate(deleteUserValidator), deleteUser);
userRoutes.post("/logout", verifyJWT, logout);
userRoutes.put("/updateUser/:id", verifyJWT, updateUser);
// admin-only: change role
userRoutes.put("/:id/role", verifyJWT, authorizeRoles("admin"), setUserRole);

export default userRoutes;
