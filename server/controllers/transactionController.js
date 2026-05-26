const { parse } = require('csv-parse/sync');
const { Parser } = require('json2csv');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper: update budget spent amount
const syncBudget = async (userId, category, month) => {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

  const result = await Transaction.aggregate([
    { $match: { userId, type: 'expense', category, date: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const spent = result[0]?.total || 0;
  await Budget.findOneAndUpdate({ userId, category, month }, { spentAmount: spent });
};

// @desc    Get all transactions (with filters, search, pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type, category, startDate, endDate, search,
      sortBy = 'date', sortOrder = 'desc',
      page = 1, limit = 20,
    } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.user._id });

    // Sync budget if it's an expense
    if (transaction.type === 'expense') {
      const month = transaction.date.toISOString().slice(0, 7);
      await syncBudget(req.user._id, transaction.category, month);
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const oldCategory = transaction.category;
    const oldMonth = transaction.date.toISOString().slice(0, 7);

    Object.assign(transaction, req.body);
    await transaction.save();

    // Re-sync budgets for old and new category/month
    if (transaction.type === 'expense') {
      const newMonth = new Date(req.body.date || transaction.date).toISOString().slice(0, 7);
      await syncBudget(req.user._id, oldCategory, oldMonth);
      if (req.body.category && req.body.category !== oldCategory) {
        await syncBudget(req.user._id, req.body.category, newMonth);
      }
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.type === 'expense') {
      const month = transaction.date.toISOString().slice(0, 7);
      await syncBudget(req.user._id, transaction.category, month);
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import transactions from CSV
// @route   POST /api/transactions/import
// @access  Private
const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    const records = parse(req.file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const transactions = records.map((row) => ({
      userId: req.user._id,
      type: row.type?.toLowerCase() === 'income' ? 'income' : 'expense',
      amount: Math.abs(parseFloat(row.amount) || 0),
      category: row.category || 'Other Expense',
      description: row.description || row.narration || '',
      date: new Date(row.date) || new Date(),
      importSource: 'csv',
    })).filter((t) => t.amount > 0);

    const inserted = await Transaction.insertMany(transactions);

    res.json({
      success: true,
      message: `${inserted.length} transactions imported`,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/transactions/export
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    const fields = ['date', 'type', 'category', 'amount', 'description', 'tags'];
    const parser = new Parser({ fields });
    const csv = parser.parse(transactions.map((t) => ({
      date: t.date.toISOString().split('T')[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      description: t.description,
      tags: t.tags.join('; '),
    })));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, importCSV, exportCSV };
