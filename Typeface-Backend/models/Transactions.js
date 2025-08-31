import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  merchant: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      'salary', 'freelance', 'investment returns', 'business income', 
    'rental income', 'side hustle', 'bonus', 'gift', 'other income','food & dining', 'groceries', 'transportation', 'shopping', 
    'entertainment', 'bills & utilities', 'healthcare', 'education',
    'travel', 'insurance', 'investment', 'rent', 'home maintenance',
    'personal care', 'subscriptions', 'other',
    ],
    required: true,
  },
  notes: {
    type: String,
  },
  paymentMode: {
    type: String,
    enum: ["cash", "card", "upi", "netbanking"],
    required: true,
    default: "cash",
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { strict: true });

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;