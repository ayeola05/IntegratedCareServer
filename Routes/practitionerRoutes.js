import express from "express";
import asyncHandler from "express-async-handler";
import Practitioner from "../Models/HealthCareProviderModel.js";
import Patient from "../Models/PatientModel.js";
import generateToken from "../utils/generateToken.js";
import {
  isPractitioner,
  protectPractitioner,
} from "../Middleware /AuthMiddleware.js";
import mailer from "../config/EmailService.js";
import jwt from "jsonwebtoken";
import Encounter from "../Models/EncounterModel.js";
import Allergies from "../Models/AllergiesModel.js";
import Task from "../Models/TaskModel.js";
import Diagnosis from "../Models/DiagnosisModel.js";
import Medication from "../Models/MedicationSchema.js";

const practitionerRouter = express.Router();
const BASE_URL = "https://integrated-server.onrender.com";

//PRACTITIONER REGISTRATION
practitionerRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      registrationNumber,
      specialty,
      workAddress,
      workPhoneNumber,
      email,
      password,
    } = req.body;

    if (!email.includes("@")) {
      res.status(400);
      throw new Error("Invalid email");
    }

    const practitionerExists = await Practitioner.findOne({ email });

    if (practitionerExists) {
      res.status(400);
      throw new Error("Practitioner already exists");
    }

    const practitioner = await Practitioner.create({
      firstName,
      lastName,
      registrationNumber,
      specialty,
      workAddress,
      workPhoneNumber,
      email,
      password,
    });

    if (practitioner) {
      res.status(201).json({
        message: "success",
      });
      const confirmationUrl = `${BASE_URL}/api/practitioner/confirmation`;
      mailer(practitioner, confirmationUrl);
    } else {
      res.status(400);
      throw new Error("Invalid Practitioner Data");
    }
  })
);

//PRACTITIONER LOGIN
practitionerRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const practitioner = await Practitioner.findOne({ email });

    if (!practitioner) {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }

    if (practitioner && (await practitioner.matchPassword(password))) {
      res.json({
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        registrationNumber: practitioner.registrationNumber,
        specialty: practitioner.specialty,
        workAddress: practitioner.workAddress,
        workPhoneNumber: practitioner.workPhoneNumber,
        email: practitioner.email,
        confirmed: practitioner.confirmed,
        token: generateToken(practitioner._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

//PRACTITIONER SHOULD ABLE TO GET A PATIENT BY ID
practitionerRouter.get(
  "/getPatient",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const patientId = req.query.patientId;
    if (!patientId) {
      res.status(400);
      throw new Error("Provide a valid patient id");
    }

    const patient = await Patient.findOne({ patientId });

    if (patient) {
      res.json({
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      });
    } else {
      res.status(400);
      throw new Error("Patient does not exist");
    }
  })
);

//ADD PATIENT
practitionerRouter.get(
  "/addPatient",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const patientId = req.query.patientId;

    if (!patientId) {
      res.status(400);
      throw new Error("Provide a valid patient id");
    }

    const patient = await Patient.findOne({ patientId });

    if (patient) {
      const isAdded = await Practitioner.findOne({ patients: patient._id });

      if (isAdded) {
        res.status(400);
        throw new Error("Patient already exists in dashboard");
      }

      await Practitioner.findByIdAndUpdate(
        req.user._id,
        {
          $push: { patients: patient._id },
        },
        { runValidators: true, new: true }
      );
      const patients = await Practitioner.findById(req.user._id).populate(
        "patients"
      );

      res.json(patients);
    }
  })
);

//GET ANOTHER PRACTITIONER BY EMAIL
practitionerRouter.get(
  "/getPractitioner",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const email = req.query.email;
    if (!email) {
      res.status(400);
      throw new Error("Provide a valid email");
    }

    if (!email.includes("@")) {
      res.status(400);
      throw new Error("Provide a valid email");
    }

    const practitioner = await Practitioner.findOne({ email });

    if (practitioner) {
      res.json({
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        registrationNumber: practitioner.registrationNumber,
        specialty: practitioner.specialty,
        workAddress: practitioner.workAddress,
        workPhoneNumber: practitioner.workPhoneNumber,
        email: practitioner.email,
      });
    } else {
      res.status(400);
      throw new Error("Practitioner does not exist");
    }
  })
);

//EMAIL CONFIRMATION
practitionerRouter.get(
  "/confirmation/:token",
  asyncHandler(async (req, res) => {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const practitioner = await Practitioner.findById(id);
    if (practitioner) {
      practitioner.confirmed = true;
      await practitioner.save();
      res.json({
        message: "Email confirmed",
      });
    } else {
      res.status(404);
      throw new Error("Practitioner not found");
    }
  })
);

//GET PROFILE
practitionerRouter.get(
  "/",
  protectPractitioner,
  asyncHandler(async (req, res) => {
    const practitioner = await Practitioner.findById(req.user._id);

    const { patients } = await practitioner.populate("patients");

    if (practitioner) {
      res.json({
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        registrationNumber: practitioner.registrationNumber,
        specialty: practitioner.specialty,
        workAddress: practitioner.workAddress,
        workPhoneNumber: practitioner.workPhoneNumber,
        email: practitioner.email,
        confirmed: practitioner.confirmed,
        patients,
      });
    } else {
      res.status(404);
      throw new Error("Practitioner not found");
    }
  })
);

//UPDATE PRACTITIONER PROFILE
practitionerRouter.patch(
  "/profile",
  protectPractitioner,
  asyncHandler(async (req, res) => {
    const practitioner = await Practitioner.findById(req.user._id);

    if (practitioner) {
      practitioner.email = req.body.email || practitioner.email;
      practitioner.firstName = req.body.firstName || practitioner.firstName;
      practitioner.lastName = req.body.lastName || practitioner.lastName;
      practitioner.workAddress =
        req.body.workAddress || practitioner.workAddress;
      practitioner.workPhoneNumber =
        req.body.workPhoneNumber || practitioner.workPhoneNumber;
      practitioner.email = req.body.email || practitioner.email;
      if (req.body.password) {
        practitioner.password = req.body.password;
      }
      const updatedPractitioner = await practitioner.save();
      res.json({
        updatedPractitioner,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// ADD AN ENCOUNTER
practitionerRouter.post(
  "/addEncounter/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const { location, reasonForVisit } = req.body;

    const patientId = req.params.patientId;

    const practitioner = await Practitioner.findById(req.user._id);

    if (!practitioner) {
      res.status(404);
      throw new Error("Practitioner not found");
    }

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    const encounter = await Encounter.create({
      patient: patient._id,
      practitioner: practitioner._id,
      location,
      reasonForVisit,
    });

    if (encounter) {
      const newEncounter = await encounter.populate(
        "practitioner",
        "firstName lastName"
      );
      res.status(201).json(newEncounter);
    } else {
      res.status(400);
      throw new Error("Invalid Data");
    }
  })
);

//ADD TASK
practitionerRouter.post(
  "/:encounterId/addTask/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const { taskName } = req.body;

    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    const task = await Task.create({
      taskName,
      patient: patient._id,
      practitioner: req.user._id,
      encounter: encounter._id,
    });

    const populatedTask = await task.populate(
      "practitioner",
      "firstName lastName"
    );

    if (populatedTask) {
      res.status(201).json(populatedTask);
    } else {
      res.status(400);
      throw new Error("Something went wrong");
    }
  })
);

//ADD MEDICATIONS
practitionerRouter.post(
  "/:encounterId/addMedication/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const { drugName, dosage, frequency } = req.body;

    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    const medication = await Medication.create({
      drugName,
      dosage,
      frequency,
      patient: patient._id,
      practitioner: req.user._id,
      encounter: encounter._id,
    });

    const populatedMedication = await medication.populate(
      "practitioner",
      "firstName lastName"
    );

    if (populatedMedication) {
      res.status(201).json(populatedMedication);
    } else {
      res.status(400);
      throw new Error("Something went wrong");
    }
  })
);

//ADD DIAGNOSIS
practitionerRouter.post(
  "/:encounterId/addDiagnosis/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const { diagnosis } = req.body;

    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    const newDiagnosis = await Diagnosis.create({
      diagnosis,
      patient: patient._id,
      practitioner: req.user._id,
      encounter: encounter._id
    });

    const populatedDiagnosis = await newDiagnosis.populate(
      "practitioner",
      "firstName lastName"
    );

    if (populatedDiagnosis) {
      res.status(201).json(populatedDiagnosis);
    } else {
      res.status(400);
      throw new Error("Something went wrong");
    }
  })
);

//ADD ALLERGY
practitionerRouter.post(
  "/:encounterId/addAllergy/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const { allergen, reaction, severity } = req.body;

    const encounterId = req.params.encounterId;

    const encounter = await Encounter.findById(encounterId);

    if (!encounter) {
      res.status(404);
      throw new Error("No encounter found");
    }

    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    const allergy = await Allergies.create({
      allergen,
      reaction,
      severity,
      patient: patient._id,
      practitioner: req.user._id,
      encounter: encounter._id,
    });

    const populatedAllergy = await allergy.populate(
      "practitioner",
      "firstName lastName"
    );

    if (populatedAllergy) {
      res.status(201).json(populatedAllergy);
    } else {
      res.status(400);
      throw new Error("Something went wrong");
    }
  })
);

//GET A PATIENTS MEDICAL HISTORY
practitionerRouter.get(
  "/medicalHistory/:patientId",
  protectPractitioner,
  asyncHandler(async (req, res) => {
    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

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

//UPDATE PATIENTS BLOOD DATA
practitionerRouter.patch(
  "/updateBloodData/:patientId",
  protectPractitioner,
  isPractitioner,
  asyncHandler(async (req, res) => {
    const patientId = req.params.patientId;

    const patient = await Patient.findOne({ patientId });

    if (patient) {
      patient.bloodType = req.body.bloodType || patient.bloodType;
      patient.genotype = req.body.genotype || patient.genotype;

      const { patientId, gender, dob, bloodType, genotype } =
        await patient.save();
      res.json({
        patientId,
        gender,
        dob,
        bloodType,
        genotype,
      });
    } else {
      res.status(404);
      throw new Error("Patient not found");
    }
  })
);

export default practitionerRouter;
