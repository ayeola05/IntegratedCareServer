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
    bloodType: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      default: null,
    },
    genotype: {
      type: String,
      enum: ["AA", "AC", "AS", "CC", "SC", "SS"],
      default: null,
    },
    confirmed: {
      type: Boolean,
      default: false,
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

//PATIENT LOGIN
patientSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
