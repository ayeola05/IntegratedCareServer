import express from "express";
import asyncHandler from "express-async-handler";
import Patient from "../Models/PatientModel.js";
import ID from "nodejs-unique-numeric-id-generator";
import generateToken from "../utils/generateToken.js";
import { protectPatient } from "../Middleware /AuthMiddleware.js";
import mailer from "../config/EmailService.js";
import jwt from "jsonwebtoken";
import Encounter from "../Models/EncounterModel.js";
import Allergies from "../Models/AllergiesModel.js";
import Diagnosis from "../Models/DiagnosisModel.js";
import Medication from "../Models/MedicationSchema.js";
import Task from "../Models/TaskModel.js";

const patientRouter = express.Router();

const BASE_URL = "https://integrated-server.onrender.com";

//PATIENTS REGISTRATION
patientRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!email.includes("@")) {
      res.status(400);
      throw new Error("Invalid email");
    }

    const patientExists = await Patient.findOne({ email });

    if (patientExists) {
      res.status(400);
      throw new Error("Patient already exists");
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      password,
      patientId: ID.generate(new Date().toJSON()),
    });

    if (patient) {
      res.status(201).json({
        message: "success",
        token: generateToken(patient._id),
      });
      const confirmationUrl = `${BASE_URL}/api/patient/confirmation`;
      mailer(patient, confirmationUrl);
    } else {
      res.status(400);
      throw new Error("Invalid Patient Data");
    }
  })
);

//PATIENTS LOGIN
patientRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });

    if (!patient) {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }

    if (patient && (await patient.matchPassword(password))) {
      res.json({
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        confirmed: patient.confirmed,
        token: generateToken(patient._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

//EMAIL CONFIRMATION
patientRouter.get(
  "/confirmation/:token",
  asyncHandler(async (req, res) => {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const patient = await Patient.findById(id);
    if (patient) {
      patient.confirmed = true;
      const confirmedPatient = await patient.save();
      return res
        .redirect("https://integrated-care.vercel.app/auth/sign-in")
        .json({
          message: "account verified",
          email: confirmedPatient.email,
        });
    } else {
      res.status(404);
      throw new Error("Patient not found");
    }
  })
);

//RESEND CONFIRMATION MAIL
// patientRouter.post(
//   "/resendConfirmation/:token",
//   asyncHandler(async (req, res) => {
//     const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
//     const patient = await Patient.findById(id);
//     if (patient) {
//       const confirmationUrl = `${BASE_URL}/api/
//       patient/confirmation`;
//       mailer(patient, confirmationUrl);
//       res.json({
//         message: "email sent",
//       });
//     } else {
//       res.status(404);
//       throw new Error("Patient not found");
//     }
//   })
// );

//GET PATIENT PROFILE
patientRouter.get(
  "/",
  protectPatient,
  asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user._id);

    if (patient) {
      res.json({
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        confirmed: patient.confirmed,
      });
    } else {
      res.status(404);
      throw new Error("Patient not found");
    }
  })
);

//UPDATE PATIENT PROFILE
patientRouter.patch(
  "/profile",
  protectPatient,
  asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user._id);

    if (patient) {
      patient.email = req.body.email || patient.email;
      patient.firstName = req.body.firstName || patient.firstName;
      patient.lastName = req.body.lastName || patient.lastName;
      patient.dob = req.body.dob || patient.dob;
      patient.age = req.body.age || patient.age;
      patient.location = req.body.location || patient.location;
      patient.occupation = req.body.occupation || patient.occupation;
      patient.gender = req.body.gender || patient.gender;
      patient.maritalStatus = req.body.maritalStatus || patient.maritalStatus;
      patient.address = req.body.address || patient.address;
      patient.phoneNumber = req.body.phoneNumber || patient.phoneNumber;
      patient.nextOfKin = req.body.nextOfKin || patient.nextOfKin;
      patient.relationshipWithNextOfKin =
        req.body.relationshipWithNextOfKin || patient.relationshipWithNextOfKin;
      patient.contactOfNextOfKin =
        req.body.contactOfNextOfKin || patient.contactOfNextOfKin;
      if (req.body.password) {
        patient.password = req.body.password;
      }
      const updatedPatient = await patient.save();
      res.json({
        updatedPatient,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//GET MEDICAL HISTORY
patientRouter.get(
  "/medicalHistory",
  protectPatient,
  asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.user._id);

    if (patient) {
      const medicalHistory = await Encounter.find({
        patient: patient._id,
      }).populate("practitioner", "firstName lastName");

      res.json(medicalHistory);
    } else {
      res.status(404);
      throw new Error("Patient history not found");
    }
  })
);

//GET ALLERGIES
patientRouter.get(
  "/getAllergies/:encounterId",
  protectPatient,
  asyncHandler(async (req, res) => {
    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const allergies = await Allergies.find({encounter: encounter._id}).populate("practitioner", "firstName lastName")

    res.json(allergies)

  })
)

//GET DIAGNOSIS
patientRouter.get(
  "/getDiagnosis/:encounterId",
  protectPatient,
  asyncHandler(async (req, res) => {
    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const diagnosis = await Diagnosis.find({encounter: encounter._id}).populate("practitioner", "firstName lastName")

    res.json(diagnosis)

  })
)

//GET MEDICATIONS
patientRouter.get(
  "/getMedications/:encounterId",
  protectPatient,
  asyncHandler(async (req, res) => {
    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const medications = await Medication.find({encounter: encounter._id}).populate("practitioner", "firstName lastName")

    res.json(medications)

  })
)

//GET TASKS
patientRouter.get(
  "/getTasks/:encounterId",
  protectPatient,
  asyncHandler(async (req, res) => {
    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const tasks = await Task.find({encounter: encounter._id}).populate("practitioner", "firstName lastName")

    res.json(tasks)

  })
)

export default patientRouter;
