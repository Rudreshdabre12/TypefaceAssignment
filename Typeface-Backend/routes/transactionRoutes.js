import express from "express";
import { 
  createTransaction, 
  listTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} from "../controllers/transactionsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all transaction routes
router.use(authenticateToken);

// Transaction CRUD operations
router.post("/", createTransaction);
router.get("/", listTransactions);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router; 