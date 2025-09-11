import { Router } from "express";
import {
  createUser,
  getAllUsers,
  userLogin,
} from "../controllers/userControllers.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/createUser", createUser);
userRoutes.post("/login", userLogin);
export default userRoutes;
