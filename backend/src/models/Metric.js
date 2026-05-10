import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  steps: { type: Number, default: 0 },
  waterLiters: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  caloriesConsumed: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  weight: { type: Number },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], default: 'good' },
  notes: { type: String, maxlength: 500 },
  // Meal breakdown
  breakfastCal: { type: Number, default: 0 },
  lunchCal: { type: Number, default: 0 },
  dinnerCal: { type: Number, default: 0 },
  snackCal: { type: Number, default: 0 },
  // Exercise log
  exercises: [{
    name: { type: String },
    duration: { type: Number },
    calories: { type: Number },
  }],
}, { timestamps: true });

metricSchema.index({ user: 1, date: -1 });

export default mongoose.model('Metric', metricSchema);
