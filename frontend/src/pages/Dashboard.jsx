import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Footprints, Droplets, Flame, Moon, Weight, TrendingUp, Zap } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import styles from './Dashboard.module.css';

const today = new Date().toISOString().split('T')[0];

function StatCard({ icon: Icon, label, value, unit, goal, color }) {
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : null;
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <div className={styles.statIcon} style={{ background: `${color}22` }}>
          <Icon size={20} color={color} />
        </div>
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statValue}>{value ?? '—'} <span className={styles.statUnit}>{unit}</span></div>
      {pct !== null && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className={styles.progressText}>{pct}% of goal</span>
        </div>
      )}
    </div>
  );
}

function calcStreak(metrics) {
  if (!metrics.length) return 0;
  const sorted = [...metrics].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const m of sorted) {
    const d = new Date(m.date + 'T00:00:00');
    const diff = Math.round((cursor - d) / 86400000);
    if (diff === 0 || diff === 1) { streak++; cursor = d; }
    else break;
  }
  return streak;
}

function weeklyAvg(metrics) {
  const last7 = metrics.filter(m => {
    const d = new Date(m.date + 'T00:00:00');
    const diff = Math.round((new Date() - d) / 86400000);
    return diff <= 7;
  });
  if (!last7.length) return null;
  const avg = (key) => (last7.reduce((s, m) => s + (m[key] || 0), 0) / last7.length).toFixed(1);
  return { steps: avg('steps'), water: avg('waterLiters'), sleep: avg('sleepHours'), calories: avg('caloriesBurned'), days: last7.length };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/metrics/${today}`).catch(() => ({ data: null })),
      api.get('/metrics?limit=30'),
      api.get('/goals'),
    ]).then(([todayRes, histRes, goalsRes]) => {
      setTodayData(todayRes.data);
      const sorted = [...histRes.data].reverse();
      setHistory(sorted.map(m => ({
        ...m,
        dateLabel: m.date.slice(5),
        bmi: m.weight && user?.height ? +(m.weight / Math.pow(user.height / 100, 2)).toFixed(1) : null,
      })));
      setGoals(goalsRes.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  const d = todayData || {};
  const streak = calcStreak(history);
  const weekly = weeklyAvg(history);
  const last14 = history.slice(-14);
  const bmiHistory = last14.filter(m => m.bmi);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Good {greeting}, {user?.name?.split(' ')[0]}!</h2>
          <p className={styles.subtitle}>Here's your health overview for today</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {streak > 0 && (
            <div className={styles.streakBadge}>
              <Zap size={14} /> {streak} day streak
            </div>
          )}
          <span className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard icon={Footprints} label="Steps" value={d.steps} unit="steps" goal={goals?.dailySteps} color="#6366f1" />
        <StatCard icon={Droplets} label="Water" value={d.waterLiters} unit="L" goal={goals?.dailyWater} color="#06b6d4" />
        <StatCard icon={Flame} label="Calories Burned" value={d.caloriesBurned} unit="kcal" goal={goals?.dailyCaloriesBurned} color="#f59e0b" />
        <StatCard icon={Moon} label="Sleep" value={d.sleepHours} unit="hrs" goal={goals?.dailySleep} color="#8b5cf6" />
        <StatCard icon={Weight} label="Weight" value={d.weight} unit="kg" color="#10b981" />
        <StatCard icon={Flame} label="Calories Consumed" value={d.caloriesConsumed} unit="kcal" color="#ef4444" />
      </div>

      {/* Weekly Summary */}
      {weekly && (
        <div className={styles.weeklySummary}>
          <h3>Weekly Average <span className={styles.weeklyDays}>({weekly.days} days logged)</span></h3>
          <div className={styles.weeklyGrid}>
            {[
              { label: 'Steps', value: Number(weekly.steps).toLocaleString(), color: '#6366f1' },
              { label: 'Water', value: `${weekly.water} L`, color: '#06b6d4' },
              { label: 'Sleep', value: `${weekly.sleep} hrs`, color: '#8b5cf6' },
              { label: 'Cal Burned', value: `${weekly.calories} kcal`, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className={styles.weeklyItem}>
                <div className={styles.weeklyValue} style={{ color }}>{value}</div>
                <div className={styles.weeklyLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {last14.length > 0 && (
        <div className={styles.charts}>
          <div className={styles.chart}>
            <h3>Steps — Last 14 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="dateLabel" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="steps" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chart}>
            <h3>Sleep & Water Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="dateLabel" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Line type="monotone" dataKey="sleepHours" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="waterLiters" stroke="#06b6d4" strokeWidth={2} dot={false} name="Water (L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {bmiHistory.length > 1 && (
            <div className={styles.chart} style={{ gridColumn: '1 / -1' }}>
              <h3>BMI History</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bmiHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dateLabel" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [v, 'BMI']} />
                  <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} name="BMI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!todayData && (
        <div className={styles.noData}>
          <TrendingUp size={40} color="#6366f1" />
          <p>No data logged for today yet.</p>
          <a href="/log" className={styles.logBtn}>Log Today's Metrics</a>
        </div>
      )}
    </div>
  );
}
