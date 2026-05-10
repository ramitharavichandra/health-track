import express from 'express';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    let goal = await Goal.findOne({ user: req.user._id });
    if (!goal) goal = await Goal.create({ user: req.user._id });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { dailySteps, dailyWater, dailyCaloriesBurned, dailySleep, targetWeight } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id },
      { dailySteps, dailyWater, dailyCaloriesBurned, dailySleep, targetWeight },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
