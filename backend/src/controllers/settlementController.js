import Settlement from "../models/Settlement.js";
import Group from "../models/Group.js";

/**
 * CREATE SETTLEMENT (SETTLE UP)
 */
export const createSettlement = async (req, res) => {
  try {
    const { amount, note, paidByUserId, receivedByUserId, groupId } = req.body;

    const callerId = req.user.id;

    // ───────────── BASIC VALIDATION ─────────────
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Amount must be positive" });
    }

    if (paidByUserId === receivedByUserId) {
      return res.status(400).json({ msg: "Payer and receiver cannot be same" });
    }

    // Caller must be payer or receiver
    if (callerId !== paidByUserId && callerId !== receivedByUserId) {
      return res.status(403).json({ msg: "Not authorized to settle" });
    }

    // ───────────── GROUP VALIDATION ─────────────
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }

      const isMember = (uid) =>
        group.members.some((m) => m.userId.toString() === uid);

      if (!isMember(paidByUserId) || !isMember(receivedByUserId)) {
        return res
          .status(400)
          .json({ msg: "Both users must be group members" });
      }
    }

    // ───────────── CREATE SETTLEMENT ─────────────
    const settlement = await Settlement.create({
      amount,
      note,
      paidByUserId,
      receivedByUserId,
      groupId: groupId || null,
      createdBy: callerId,
    });

    res.json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
