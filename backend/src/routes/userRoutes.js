import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  userLogin,
} from "../controllers/userControllers.js";

import {
  createUserValidator,
  deleteUserValidator,
  loginValidator,
  validate,
} from "../utils/validator.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/createUser", validate(createUserValidator), createUser);
userRoutes.post("/login", validate(loginValidator), userLogin);
userRoutes.delete("/deleteUser/:id", validate(deleteUserValidator), deleteUser);

export default userRoutes;
