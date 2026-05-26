const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a month
// @route   GET /api/budgets?month=2025-05
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { month = new Date().toISOString().slice(0, 7) } = req.query;
    const budgets = await Budget.find({ userId: req.user._id, month });
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
const upsertBudget = async (req, res, next) => {
  try {
    const { category, limitAmount, month } = req.body;

    // Calculate current spent amount for this category/month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', category, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const spentAmount = result[0]?.total || 0;

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limitAmount, spentAmount },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudgets, upsertBudget, deleteBudget };
