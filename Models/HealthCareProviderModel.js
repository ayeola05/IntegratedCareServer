import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const practitionerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    workAddress: {
      type: String,
      required: true,
    },
    workPhoneNumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//PRACTITIONER REGISTER
practitionerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// PRACTITIONER LOGIN
practitionerSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

const Practitioner = mongoose.model("Practitioner", practitionerSchema);

export default Practitioner;

// {
//   "email": "ayeola05@gmail.com",
//   "password": "1234567",
//   "firstName": "Taiwo",
//   "lastName": "Ayeola",
//   "registrationNumber": "123qwe",
//   "specialty": "Big pharm",
//   "workAddress": "World",
//   "workPhoneNumber": "8080808080"
//   }
