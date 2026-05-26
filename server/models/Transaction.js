const mongoose = require('mongoose');

const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income'];
const CATEGORIES_EXPENSE = [
  'Rent', 'Groceries', 'Food & Dining', 'Transportation', 'Utilities',
  'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Travel',
  'Insurance', 'EMI / Loan', 'Subscriptions', 'Personal Care', 'Other Expense',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description too long'],
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    tags: [{ type: String, trim: true }],
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null,
    },
    // For imported CSV transactions
    importSource: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index for fast user + date queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.CATEGORIES_INCOME = CATEGORIES_INCOME;
module.exports.CATEGORIES_EXPENSE = CATEGORIES_EXPENSE;
