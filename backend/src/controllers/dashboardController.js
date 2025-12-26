import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";

/**
 * GET DASHBOARD DATA
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // ───────────── 1. GROUP COUNT ─────────────
    const groups = await Group.find({
      "members.userId": userId,
    });
    const totalGroups = groups.length;

    // ───────────── 2. EXPENSES INVOLVING USER ─────────────
    const expenses = await Expense.find({
      $or: [{ paidByUserId: userId }, { "splits.userId": userId }],
    });

    let youOwe = 0;
    let youAreOwed = 0;

    // Used to calculate friend count
    const friendsSet = new Set();

    expenses.forEach((expense) => {
      const isPayer = expense.paidByUserId.toString() === userId;

      if (isPayer) {
        // Others owe you
        expense.splits.forEach((split) => {
          if (split.userId.toString() !== userId && !split.paid) {
            youAreOwed += split.amount;
            friendsSet.add(split.userId.toString());
          }
        });
      } else {
        // You owe someone else
        const mySplit = expense.splits.find(
          (s) => s.userId.toString() === userId && !s.paid
        );

        if (mySplit) {
          youOwe += mySplit.amount;
          friendsSet.add(expense.paidByUserId.toString());
        }
      }
    });

    // ───────────── 3. APPLY SETTLEMENTS ─────────────
    const settlements = await Settlement.find({
      $or: [{ paidByUserId: userId }, { receivedByUserId: userId }],
    });

    settlements.forEach((settlement) => {
      if (settlement.paidByUserId.toString() === userId) {
        // You paid → your owing reduces
        youOwe -= settlement.amount;
      } else {
        // Someone paid you → your owed reduces
        youAreOwed -= settlement.amount;
      }
    });

    // Prevent negative numbers
    youOwe = Math.max(0, youOwe);
    youAreOwed = Math.max(0, youAreOwed);

    // ───────────── 4. FINAL RESPONSE ─────────────
    res.json({
      totalGroups,
      totalFriends: friendsSet.size,
      youOwe,
      youAreOwed,
      netBalance: youAreOwed - youOwe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
