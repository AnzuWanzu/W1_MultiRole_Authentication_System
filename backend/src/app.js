import express from "express";
import { config } from "dotenv";
import cors from "cors";
import path from "path";
import appRouter from "./routes/appRoutes.js";
//import appRouter from "./routes/appRoutes";

config();
const app = express();

//Middleware stuff
app.use(express.json());
//app.use(cors())

//Devlogging stuff

//Main Route (dapat mag-isa lang ito)
app.use("/api/v1", appRouter);
//Production stuff

export default app;
