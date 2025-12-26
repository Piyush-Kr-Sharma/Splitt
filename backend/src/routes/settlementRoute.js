import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createSettlement } from "../controllers/settlementController.js";

const router = express.Router();

// Settle up
router.post("/", auth, createSettlement);

export default router;
