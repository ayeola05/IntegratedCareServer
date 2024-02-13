import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js";
import { errorHandler, notFound } from "./Middleware /Errors.js";
import cors from "cors";
import patientRouter from "./Routes/patientRoutes.js";
import practitionerRouter from "./Routes/practitionerRoutes.js";

dotenv.config();
connectDatabase();

const app = express();
app.use(cors("*"));
app.use(express.json());

//API
app.use("/api/patient", patientRouter);
app.use("/api/practitioner", practitionerRouter);

//ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

const PORT = 8080;

app.listen(PORT, console.log(`server is running in port ${PORT}`));
