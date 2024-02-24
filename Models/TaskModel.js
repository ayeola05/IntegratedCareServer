import mongoose from "mongoose";

export const TaskSchema = mongoose.Schema(
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
    encounter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Encounter",
    },
    taskName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
