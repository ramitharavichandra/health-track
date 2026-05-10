import express from 'express';
import Metric from '../models/Metric.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Log or update today's metric
router.post('/', async (req, res) => {
  try {
    const { date, steps, waterLiters, caloriesBurned, caloriesConsumed, sleepHours, weight, mood, notes, breakfastCal, lunchCal, dinnerCal, snackCal, exercises } = req.body;
    const fields = { steps, waterLiters, caloriesBurned, caloriesConsumed, sleepHours, weight, mood, notes, breakfastCal, lunchCal, dinnerCal, snackCal, exercises };
    const existing = await Metric.findOne({ user: req.user._id, date });
    if (existing) {
      Object.assign(existing, fields);
      await existing.save();
      return res.json(existing);
    }
    const metric = await Metric.create({ user: req.user._id, date, ...fields });
    res.status(201).json(metric);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all metrics for the user (last 30 days by default)
router.get('/', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const metrics = await Metric.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(Number(limit));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get metric for a specific date
router.get('/:date', async (req, res) => {
  try {
    const metric = await Metric.findOne({ user: req.user._id, date: req.params.date });
    if (!metric) return res.status(404).json({ message: 'No entry for this date' });
    res.json(metric);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a metric entry
router.delete('/:date', async (req, res) => {
  try {
    await Metric.findOneAndDelete({ user: req.user._id, date: req.params.date });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
