import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dailySteps: { type: Number, default: 10000 },
  dailyWater: { type: Number, default: 2.5 },
  dailyCaloriesBurned: { type: Number, default: 500 },
  dailySleep: { type: Number, default: 8 },
  targetWeight: { type: Number },
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
