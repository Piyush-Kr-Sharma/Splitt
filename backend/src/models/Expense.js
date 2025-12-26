import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  splitType: {
    type: String,
    enum: ["equal", "exact", "percentage"],
  },
  paidByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  splits: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: Number,
      paid: {
        type: Boolean,
        default: false,
      },
    },
  ],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Number,
    default: () => Date.now(),
  },
});

export default mongoose.model("Expense", expenseSchema);
