import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const patientSchema = mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    occupation: {
      type: String,
      trim: true,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced"],
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    nextOfKin: {
      type: String,
      default: null,
    },
    relationshipWithNextOfKin: {
      type: String,
      default: null,
    },
    contactOfNextOfKin: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//PATIENT REGISTER
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
