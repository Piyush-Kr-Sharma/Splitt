import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { getGroupBalances } from "../controllers/groupBalanceController.js";

const router = express.Router();

// Get group balances
router.get("/:groupId/balances", auth, getGroupBalances);

export default router;
