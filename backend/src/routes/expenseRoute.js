import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { addExpense } from "../controllers/expenseController.js";

const router = express.Router();

// Add expense
router.post("/", auth, addExpense);

export default router;
