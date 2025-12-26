import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";

/**
 * GET GROUP BALANCES
 * Who owes whom inside a group
 */
export const getGroupBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    // ───────────── 1. FETCH GROUP ─────────────
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const isMember = group.members.some((m) => m.userId.toString() === userId);
    if (!isMember) return res.status(403).json({ msg: "Not a group member" });

    // Get all member IDs
    const memberIds = group.members.map((m) => m.userId.toString());

    // ───────────── 2. INIT LEDGER ─────────────
    // ledger[debtor][creditor] = amount
    const ledger = {};
    memberIds.forEach((a) => {
      ledger[a] = {};
      memberIds.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    // ───────────── 3. APPLY EXPENSES ─────────────
    const expenses = await Expense.find({ groupId });

    expenses.forEach((exp) => {
      const payer = exp.paidByUserId.toString();

      exp.splits.forEach((split) => {
        const debtor = split.userId.toString();
        if (debtor === payer || split.paid) return;

        ledger[debtor][payer] += split.amount;
      });
    });

    // ───────────── 4. APPLY SETTLEMENTS ─────────────
    const settlements = await Settlement.find({ groupId });

    settlements.forEach((st) => {
      const from = st.paidByUserId.toString();
      const to = st.receivedByUserId.toString();

      // Paid back → reduce debt
      ledger[from][to] -= st.amount;
      if (ledger[from][to] < 0) ledger[from][to] = 0;
    });

    // ───────────── 5. NET OPPOSITE DEBTS ─────────────
    memberIds.forEach((a) => {
      memberIds.forEach((b) => {
        if (a >= b) return;

        const diff = ledger[a][b] - ledger[b][a];
        if (diff > 0) {
          ledger[a][b] = diff;
          ledger[b][a] = 0;
        } else {
          ledger[b][a] = -diff;
          ledger[a][b] = 0;
        }
      });
    });

    // ───────────── 6. FORMAT RESPONSE ─────────────
    const result = [];

    memberIds.forEach((from) => {
      memberIds.forEach((to) => {
        if (ledger[from][to] > 0) {
          result.push({
            from,
            to,
            amount: ledger[from][to],
          });
        }
      });
    });

    res.json({
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      balances: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
