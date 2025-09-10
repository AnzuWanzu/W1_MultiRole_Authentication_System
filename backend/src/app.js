import express from "express";
import { config } from "dotenv";
import cors from "cors";
import path from "path";
//import appRouter from "./routes/appRoutes";

config();
const app = express();
const PORT = process.env.PORT || 5001;

//Middleware stuff
app.use(express.json());
//app.use(cors())

//Devlogging stuff

//Main Route (dapat mag-isa lang ito)
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

//Production stuff
