import { Router } from "express";
import {
  createUser,
  getAllUsers,
  userLogin,
} from "../controllers/userControllers.js";
import {
  createUserValidator,
  loginValidator,
  validate,
} from "../utils/validator.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/createUser", validate(createUserValidator), createUser);
userRoutes.post("/login", validate(loginValidator), userLogin);
export default userRoutes;
