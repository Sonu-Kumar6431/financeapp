const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    category: { type: String, default: 'Bill' },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', null],
      default: null,
    },
    // Whether the user has been notified for the current cycle
    notified: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
