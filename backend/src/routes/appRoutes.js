import { Router } from "express";
import userRoutes from "./userRoutes.js";
//other route imports

const appRouter = Router();

appRouter.use("/user", userRoutes);
// appRouter.use(,)

export default appRouter;
