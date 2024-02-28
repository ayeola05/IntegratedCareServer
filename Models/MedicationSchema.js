import mongoose from "mongoose";

export const MedicationSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Practitioner",
    },
    // encounter: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "Encounter",
    // },
    drugName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Medication = mongoose.model("Medication", MedicationSchema);

export default Medication;
