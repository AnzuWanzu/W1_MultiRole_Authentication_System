import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  userLogin,
  logout,
  updateUser,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../utils/tokenManager.js";

import {
  createUserValidator,
  deleteUserValidator,
  loginValidator,
  validate,
} from "../utils/validator.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.get("/:id", getUserById);
userRoutes.post("/createUser", validate(createUserValidator), createUser);
userRoutes.post("/login", validate(loginValidator), userLogin);
userRoutes.delete("/deleteUser/:id", verifyJWT, validate(deleteUserValidator), deleteUser);
userRoutes.post("/logout", verifyJWT, logout);
userRoutes.put("/updateUser/:id", verifyJWT, updateUser);

export default userRoutes;
