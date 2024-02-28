import mongoose from "mongoose";

export const DiagnosisSchema = mongoose.Schema(
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
    diagnosis: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Diagnosis = mongoose.model("Diagnosis", DiagnosisSchema);

export default Diagnosis;
