import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import connectDB from "./utils/dbConnect.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server started on port 3000");
});

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/receipts", receiptRoutes);
app.use("/analytics", analyticsRoutes);

app.get("/",(req,res)=>{
    res.send("Hello World!");
});

// Error handling middleware
app.use(errorHandler);