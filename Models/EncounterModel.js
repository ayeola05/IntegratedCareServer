import mongoose from "mongoose";
import { ProcedureSchema } from "./ProcedureModel.js";
import { AllergiesSchema } from "./AllergiesModel.js";
import { DiagnosisSchema } from "./DiagnosisModel.js";
import { MedicationSchema } from "./MedicationSchema.js";
import { TaskSchema } from "./TaskModel.js";

const EncounterSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    practitionerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Practitioner",
    },
    location: {
      type: String,
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
    // procedures: [ProcedureSchema],
    allergies: [AllergiesSchema],
    diagnosis: [DiagnosisSchema],
    medication: [MedicationSchema],
    task: [TaskSchema],
  },
  {
    timestamps: true,
  }
);

const Encounter = mongoose.model("Encounter", EncounterSchema);

export default Encounter;
