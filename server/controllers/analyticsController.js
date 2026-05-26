const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Dashboard summary (current month totals)
// @route   GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { month = new Date().toISOString().slice(0, 7) } = req.query;

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const result = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = result.find((r) => r._id === 'income')?.total || 0;
    const expense = result.find((r) => r._id === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        income,
        expense,
        savings: income - expense,
        savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
        month,
      },
    });
  } catch (error) { next(error); }
};

// @desc    Monthly trend for last N months
// @route   GET /api/analytics/monthly-trend?months=6
const getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const months = parseInt(req.query.months) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    const result = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Normalize into chart-friendly format
    const map = {};
    result.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0, savings: 0 };
      map[key][_id.type] = total;
    });

    const data = Object.values(map).map((m) => ({
      ...m,
      savings: m.income - m.expense,
    }));

    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @desc    Category-wise breakdown (expense or income)
// @route   GET /api/analytics/category-breakdown?month=2025-05&type=expense
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {
      month = new Date().toISOString().slice(0, 7),
      type  = 'expense',
    } = req.query;

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const result = await Transaction.aggregate([
      { $match: { userId, type, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalExpense = result.reduce((sum, r) => sum + r.total, 0);
    const data = result.map((r) => ({
      category: r._id,
      amount: r.total,
      count: r.count,
      percentage: totalExpense > 0 ? Math.round((r.total / totalExpense) * 100) : 0,
    }));

    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @desc    Recent transactions for dashboard
// @route   GET /api/analytics/recent
const getRecent = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);
    res.json({ success: true, data: transactions });
  } catch (error) { next(error); }
};

module.exports = { getSummary, getMonthlyTrend, getCategoryBreakdown, getRecent };
