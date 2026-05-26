const Goal = require('../models/Goal');

const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, data: goals });
  } catch (error) { next(error); }
};

const createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (error) { next(error); }
};

const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    Object.assign(goal, req.body);

    // Auto-complete if target reached
    if (goal.savedAmount >= goal.targetAmount) goal.status = 'completed';

    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) { next(error); }
};

// Add savings contribution to a goal
const contributeToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + parseFloat(amount));
    if (goal.savedAmount >= goal.targetAmount) goal.status = 'completed';

    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) { next(error); }
};

const deleteGoal = async (req, res, next) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};

module.exports = { getGoals, createGoal, updateGoal, contributeToGoal, deleteGoal };
