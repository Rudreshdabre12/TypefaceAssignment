import Transaction from "../models/Transactions.js";

// Expenses by category
export const getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to } = req.query;

    const matchStage = {
      userId,
      transactionType: "expense",
    };
    if (from && to) {
      matchStage.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const aggregation = [
      { $match: matchStage },
      {
        $facet: {
          totalExpenses: [
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          categoryData: [
            {
              $group: {
                _id: "$category",
                amount: { $sum: "$amount" },
              },
            },
            { $sort: { amount: -1 } },
          ],
        },
      },
      {
        $unwind: {
          path: "$totalExpenses",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          totalExpenses: { $ifNull: ["$totalExpenses.total", 0] },
          categoryData: {
            $map: {
              input: "$categoryData",
              as: "category",
              in: {
                name: "$$category._id",
                amount: "$$category.amount",
                percentage: {
                  $cond: [
                    { $eq: [{ $ifNull: ["$totalExpenses.total", 0] }, 0] },
                    "0.0",
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              { $divide: ["$$category.amount", "$totalExpenses.total"] },
                              100,
                            ],
                          },
                          1,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ];

    const results = await Transaction.aggregate(aggregation);

    if (!results || results.length === 0) {
      return res.json({
        categoryData: [],
        totalExpenses: 0,
      });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Expenses trend over time (by date)
export const getExpensesByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const aggregation = [
      {
        $match: {
          userId,
          transactionType: "expense",
          date: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $facet: {
          dailyData: [
            {
              $project: {
                _id: 0,
                date: "$_id",
                displayDate: {
                  $dateToString: { format: "%b %d", date: { $toDate: "$_id" } },
                },
                amount: "$amount",
                transactionCount: "$transactionCount",
              },
            },
          ],
          summaryStats: [
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
                highestDay: { $max: "$amount" },
                activeDays: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                total: 1,
                highestDay: 1,
                dailyAverage: { $round: [{ $divide: ["$total", 30] }, 2] },
                activeDays: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$summaryStats",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          dailyData: 1,
          summaryStats: {
            total: { $ifNull: ["$summaryStats.total", 0] },
            highestDay: { $ifNull: ["$summaryStats.highestDay", 0] },
            dailyAverage: { $ifNull: ["$summaryStats.dailyAverage", 0] },
            activeDays: { $ifNull: ["$summaryStats.activeDays", 0] },
          },
        },
      },
    ];

    const results = await Transaction.aggregate(aggregation);

    if (!results || results.length === 0 || results[0].dailyData.length === 0) {
      return res.json({
        dailyData: [],
        summaryStats: {
          total: 0,
          highestDay: 0,
          dailyAverage: 0,
          activeDays: 0,
        },
      });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Transaction Summary
export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Transaction.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalTransactions: 1,
          totalIncome: 1,
          totalExpense: 1,
          totalBalance: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },
    ]);

    if (summary.length === 0) {
      return res.json({
        totalTransactions: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalBalance: 0,
      });
    }

    res.json(summary[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Monthly Summary
export const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 6);

    // 1. Get raw monthly data from DB
    const monthlyDataAggregation = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          income: {
            $sum: { $cond: [{ $eq: ["$transactionType", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$transactionType", "expense"] }, "$amount", 0] },
          },
          transactions: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: "%b %Y",
              date: { $toDate: { $concat: ["$_id", "-01"] } },
            },
          },
          income: "$income",
          expense: "$expense",
          net: { $subtract: ["$income", "$expense"] },
          transactions: "$transactions",
        },
      },
    ]);

    if (monthlyDataAggregation.length === 0) {
      return res.json({
        monthlyData: [],
        currentMonth: { income: 0, expense: 0, net: 0 },
        averages: { income: 0, expense: 0, net: 0 },
        bestMonth: {},
      });
    }

    // 2. Calculate summary stats in JS
    const totalMonths = monthlyDataAggregation.length;
    const totals = monthlyDataAggregation.reduce(
      (acc, month) => {
        acc.income += month.income;
        acc.expense += month.expense;
        acc.net += month.net;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );

    const averages = {
      income: Math.round(totals.income / totalMonths),
      expense: Math.round(totals.expense / totalMonths),
      net: Math.round(totals.net / totalMonths),
    };

    const bestMonth = monthlyDataAggregation.reduce((best, current) => {
      return current.net > best.net ? current : best;
    }, monthlyDataAggregation[0]);

    const currentMonthData = monthlyDataAggregation[monthlyDataAggregation.length - 1];
    const currentMonth = {
        income: currentMonthData.income,
        expense: currentMonthData.expense,
        net: currentMonthData.net
    }

    // 3. Assemble final response
    res.json({
      monthlyData: monthlyDataAggregation,
      currentMonth,
      averages,
      bestMonth,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
