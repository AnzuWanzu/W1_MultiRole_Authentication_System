import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userControllers.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/createUser", createUser);
export default userRoutes;
