import express from "express";
import {
  getExpensesByCategory,
  getExpensesByDate,
  getTransactionSummary,
  getMonthlySummary,
} from "../controllers/analyticsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all analytics routes
router.use(authenticateToken);

// Analytics routes
router.get("/expenses-by-category", getExpensesByCategory);
router.get("/expenses-by-date", getExpensesByDate);
router.get("/summary", getTransactionSummary);
router.get("/monthly-summary", getMonthlySummary);

export default router;