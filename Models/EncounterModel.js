import mongoose from "mongoose";

const EncounterSchema = mongoose.Schema(
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
    location: {
      type: String,
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Encounter = mongoose.model("Encounter", EncounterSchema);

export default Encounter;
