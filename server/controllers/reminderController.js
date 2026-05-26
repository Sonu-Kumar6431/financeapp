const Reminder = require('../models/Reminder');

const getReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ dueDate: 1 });
    res.json({ success: true, data: reminders });
  } catch (error) { next(error); }
};

const createReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) { next(error); }
};

const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, data: reminder });
  } catch (error) { next(error); }
};

const markPaid = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });

    reminder.isPaid = true;

    // If recurring, set next due date
    if (reminder.isRecurring && reminder.recurringInterval) {
      const next = new Date(reminder.dueDate);
      if (reminder.recurringInterval === 'weekly') next.setDate(next.getDate() + 7);
      if (reminder.recurringInterval === 'monthly') next.setMonth(next.getMonth() + 1);
      if (reminder.recurringInterval === 'yearly') next.setFullYear(next.getFullYear() + 1);
      reminder.dueDate = next;
      reminder.isPaid = false;
      reminder.notified = false;
    }

    await reminder.save();
    res.json({ success: true, data: reminder });
  } catch (error) { next(error); }
};

const deleteReminder = async (req, res, next) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) { next(error); }
};

module.exports = { getReminders, createReminder, updateReminder, markPaid, deleteReminder };
