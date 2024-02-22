import mongoose from "mongoose";

export const TaskSchema = mongoose.Schema(
  {
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
