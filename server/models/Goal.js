const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title too long'],
    },
    description: { type: String, trim: true, default: '' },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target must be positive'],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    category: {
      type: String,
      default: 'General',
      enum: ['Emergency Fund', 'Vacation', 'Home', 'Vehicle', 'Education', 'Retirement', 'General'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active',
    },
    icon: { type: String, default: '🎯' },
  },
  { timestamps: true }
);

goalSchema.virtual('progressPercent').get(function () {
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

goalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.savedAmount);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
