import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  members: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      role: String,
      joinedAt: Number,
    },
  ],
});

export default mongoose.model("Group", groupSchema);
