import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createGroup, getUserGroups } from "../controllers/groupController.js";

const router = express.Router();

router.post("/", auth, createGroup);
router.get("/", auth, getUserGroups);

export default router;
