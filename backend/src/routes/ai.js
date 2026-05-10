import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Metric from '../models/Metric.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.get('/insights', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: 'AI insights not configured.' });
    }

    const [metrics, goal] = await Promise.all([
      Metric.find({ user: req.user._id }).sort({ date: -1 }).limit(7),
      Goal.findOne({ user: req.user._id }),
    ]);

    if (!metrics.length) {
      return res.status(400).json({ message: 'Log at least one day of data to get AI insights.' });
    }

    const summary = metrics.map(m => ({
      date: m.date,
      steps: m.steps,
      water: m.waterLiters,
      sleep: m.sleepHours,
      caloriesBurned: m.caloriesBurned,
      caloriesConsumed: m.caloriesConsumed,
      weight: m.weight,
      mood: m.mood,
    }));

    const prompt = `You are a friendly health coach. Analyze this user's last 7 days of health data and give 3-4 specific, actionable insights.

User goals: steps/day=${goal?.dailySteps || 10000}, water/day=${goal?.dailyWater || 2.5}L, sleep/day=${goal?.dailySleep || 8}hrs, calories burned/day=${goal?.dailyCaloriesBurned || 500}kcal

Health data (most recent first):
${JSON.stringify(summary, null, 2)}

User profile: ${req.user.name}, age=${req.user.age || 'unknown'}, weight=${req.user.weight || 'unknown'}kg, height=${req.user.height || 'unknown'}cm

Give insights in this exact JSON format — no markdown, no extra text:
{
  "overall": "One sentence overall assessment",
  "insights": [
    { "type": "positive|warning|tip", "title": "Short title", "detail": "One actionable sentence" }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error('AI insights error:', err.message);
    res.status(500).json({ message: 'Failed to generate insights.' });
  }
});

export default router;
