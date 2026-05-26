const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    limitAmount: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Budget must be positive'],
    },
    month: {
      type: String, // Format: "YYYY-MM"  e.g. "2025-05"
      required: true,
    },
    // Cached spent amount — updated via transaction hooks
    spentAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One budget per user per category per month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

budgetSchema.virtual('remainingAmount').get(function () {
  return this.limitAmount - this.spentAmount;
});

budgetSchema.virtual('percentUsed').get(function () {
  return Math.round((this.spentAmount / this.limitAmount) * 100);
});

budgetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
