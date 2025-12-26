import Expense from "../models/Expense.js";
import Group from "../models/Group.js";

export const addExpense = async (req, res) => {
  try {
    const { description, amount, splitType, splits, paidByUserId, groupId } =
      req.body;

    const userId = req.user.id;

    // ───────────────── VALIDATIONS ─────────────────
    if (!description || !amount || !splitType || !splits?.length) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    if (!["equal", "exact", "percentage"].includes(splitType)) {
      return res.status(400).json({ msg: "Invalid split type" });
    }

    // If group expense, validate membership
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ msg: "Group not found" });

      const isMember = group.members.some(
        (m) => m.userId.toString() === userId
      );
      if (!isMember) return res.status(403).json({ msg: "Not a group member" });
    }

    // ───────────────── SPLIT LOGIC ─────────────────
    let finalSplits = [];

    if (splitType === "equal") {
      const perPerson = amount / splits.length;

      finalSplits = splits.map((s) => ({
        userId: s.userId,
        amount: perPerson,
        paid: s.userId === paidByUserId,
      }));
    }

    if (splitType === "exact") {
      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (total !== amount) {
        return res
          .status(400)
          .json({ msg: "Exact split must equal total amount" });
      }

      finalSplits = splits.map((s) => ({
        userId: s.userId,
        amount: s.amount,
        paid: s.userId === paidByUserId,
      }));
    }

    if (splitType === "percentage") {
      const totalPercent = splits.reduce((sum, s) => sum + s.percentage, 0);
      if (totalPercent !== 100) {
        return res.status(400).json({ msg: "Percentages must add up to 100" });
      }

      finalSplits = splits.map((s) => ({
        userId: s.userId,
        amount: (amount * s.percentage) / 100,
        paid: s.userId === paidByUserId,
      }));
    }

    // ───────────────── CREATE EXPENSE ─────────────────
    const expense = await Expense.create({
      description,
      amount,
      splitType,
      paidByUserId,
      splits: finalSplits,
      groupId: groupId || null,
      createdBy: userId,
    });

    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
