import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoute.js";
import expenseRoutes from "./routes/expenseRoute.js";
import settlementRoutes from "./routes/settlementRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import groupBalanceRoutes from "./routes/groupBalanceRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/groups", groupBalanceRoutes);
app.get("/", (req, res) => {
  res.send("Splitt Backend Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
