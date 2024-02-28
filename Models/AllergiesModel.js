import mongoose from "mongoose";

export const AllergiesSchema = mongoose.Schema(
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
    allergen: {
      type: String,
      required: true,
    },
    reaction: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Allergies = mongoose.model("Allergies", AllergiesSchema);

export default Allergies;
