import Transaction from "../models/Transactions.js";
import User from "../models/User.js";

// Create income/expense entry
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user._id; // comes from auth middleware
    const {
      transactionType,
      amount,
      currency,
      merchant,
      category,
      notes,
      paymentMode,
      date,
    } = req.body;
    // basic validation
    if (!transactionType || !amount || !category || !paymentMode) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const mode = paymentMode.toLowerCase();
    const cat = category.toLowerCase();

    
    const transaction = new Transaction({
      userId,
      transactionType,
      amount,
      currency: currency || "INR",
      merchant,
      category:cat,
      notes,
      paymentMode:mode,
      date,
    });
    
    await transaction.save();
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.transactions.push(transaction._id);
    
    
    await user.save();

    res.status(201).json({ message: "Transaction created", transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List transactions with optional date range & pagination
export const listTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    let {
      page = 1,
      limit = 10,
      category,
      transactionType,
      paymentMode,
      from,
      to,
      dateRange // 'today', 'week', 'month', or 'custom'
    } = req.query;
    

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const query = { userId };

    // Filters (category, type, paymentMode)
    if (category && category !== 'all') {
      const categories = Array.isArray(category) ? category : [category];
      query.category = { $in: categories };
    }
    if (transactionType && transactionType !== 'all') {
      const types = Array.isArray(transactionType) ? transactionType : [transactionType];
      query.transactionType = { $in: types };
    }
    if (paymentMode && paymentMode !== 'all') {
      const modes = Array.isArray(paymentMode) ? paymentMode : [paymentMode];
      query.paymentMode = { $in: modes };
    }

    // --- DATE HELPERS ---
    // Change this to 'createdAt' if your model uses createdAt instead of date
    const dateField = 'date';

    const isoDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Parse incoming date string safely:
    // - If "YYYY-MM-DD" then treat as UTC midnight of that day
    // - Else try Date constructor (accepts ISO 8601)
    const parseDateSafe = (val) => {
      if (!val) return null;
      if (isoDateOnlyRegex.test(val)) {
        // treat as UTC midnight
        return new Date(val + 'T00:00:00.000Z');
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // startOfDay/endOfDay in UTC
    const startOfDayUTC = (d) => {
      if (!d) return null;
      const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      return r;
    };
    const endOfDayUTC = (d) => {
      if (!d) return null;
      // last ms of the day in UTC
      const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
      return r;
    };

    // Build date range
    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (dateRange) {
      switch (dateRange) {
        case 'today':
          startDate = startOfDayUTC(now);
          endDate = endOfDayUTC(now);
          break;
        case 'week':
          // last 7 days (including today)
          {
            const sevenDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6); // include today => 7 days: 6 days back + today
            startDate = startOfDayUTC(sevenDaysAgo);
            endDate = endOfDayUTC(now);
          }
          break;
        case 'month':
          // from first day of current month to today (inclusive)
          startDate = startOfDayUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
          endDate = endOfDayUTC(now);
          break;
        case 'custom': {
          const f = parseDateSafe(from);
          const t = parseDateSafe(to);
          if (f) startDate = startOfDayUTC(f);
          if (t) endDate = endOfDayUTC(t);
          break;
        }
        default:
          // unknown token — ignore and let from/to handle it (or no date filter)
          break;
      }
    } else if (from || to) {
      const f = parseDateSafe(from);
      const t = parseDateSafe(to);
      if (f) startDate = startOfDayUTC(f);
      if (t) endDate = endOfDayUTC(t);
    }

    // If we have an endDate, convert to an exclusive upper bound by adding 1 ms or better: add 1 day at 00:00 UTC
    if (startDate || endDate) {
      query[dateField] = {};
      if (startDate) query[dateField].$gte = startDate;

      if (endDate) {
        // build exclusive end: next day's midnight in UTC
        const endExclusive = new Date(Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate() + 1, // next day
          0, 0, 0, 0
        ));
        query[dateField].$lt = endExclusive;
      }
    }
    
    const transactions = await Transaction.find(query)
      .sort({ [dateField]: -1 })             // newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData._id;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction updated", transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};