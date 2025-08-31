import express from "express";
import { uploadReceiptImage, uploadReceiptPdf, uploadTransactionHistoryPdf } from "../controllers/receiptController.js";
import { authenticateToken } from "../middleware/auth.js";
import handleUpload from "../middleware/upload.js";

const router = express.Router();

// Apply authentication middleware to all receipt routes
router.use(authenticateToken);

// Receipt upload routes
router.post("/image", handleUpload, uploadReceiptImage);
router.post("/pdf", handleUpload, uploadReceiptPdf);
router.post("/history-pdf", handleUpload, uploadTransactionHistoryPdf);

export default router;