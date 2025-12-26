import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  date: {
    type: Number,
    default: () => Date.now(),
  },
  paidByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receivedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null, // null = 1-to-1 settlement
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Settlement", settlementSchema);
