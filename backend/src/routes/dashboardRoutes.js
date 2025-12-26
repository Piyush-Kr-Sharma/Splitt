import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

// Dashboard data
router.get("/", auth, getDashboardData);

export default router;
