import { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './LogMetric.module.css';

const today = new Date().toISOString().split('T')[0];

const moodOptions = ['great', 'good', 'okay', 'bad', 'terrible'];
const moodEmoji = { great: '😄', good: '🙂', okay: '😐', bad: '😔', terrible: '😢' };

export default function LogMetric() {
  const [form, setForm] = useState({
    date: today,
    steps: '',
    waterLiters: '',
    caloriesBurned: '',
    caloriesConsumed: '',
    sleepHours: '',
    weight: '',
    mood: 'good',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/metrics/${form.date}`)
      .then(r => {
        const d = r.data;
        setForm(prev => ({
          ...prev,
          steps: d.steps || '',
          waterLiters: d.waterLiters || '',
          caloriesBurned: d.caloriesBurned || '',
          caloriesConsumed: d.caloriesConsumed || '',
          sleepHours: d.sleepHours || '',
          weight: d.weight || '',
          mood: d.mood || 'good',
          notes: d.notes || '',
        }));
      })
      .catch(() => {
        setForm(prev => ({ ...prev, steps: '', waterLiters: '', caloriesBurned: '', caloriesConsumed: '', sleepHours: '', weight: '', mood: 'good', notes: '' }));
      });
  }, [form.date]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/metrics', {
        ...form,
        steps: Number(form.steps) || 0,
        waterLiters: Number(form.waterLiters) || 0,
        caloriesBurned: Number(form.caloriesBurned) || 0,
        caloriesConsumed: Number(form.caloriesConsumed) || 0,
        sleepHours: Number(form.sleepHours) || 0,
        weight: form.weight ? Number(form.weight) : undefined,
      });
      setSuccess('Health metrics saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, unit, min = 0, step = 1) => (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.inputWrap}>
        <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} min={min} step={step} placeholder="0" />
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Log Health Metrics</h2>
        <p>Track your daily health data</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={styles.dateInput} max={today} />
        </div>

        <div className={styles.grid}>
          {field('steps', 'Steps', 'steps', 0, 100)}
          {field('waterLiters', 'Water Intake', 'L', 0, 0.1)}
          {field('caloriesBurned', 'Calories Burned', 'kcal', 0, 10)}
          {field('caloriesConsumed', 'Calories Consumed', 'kcal', 0, 10)}
          {field('sleepHours', 'Sleep Duration', 'hrs', 0, 0.5)}
          {field('weight', 'Body Weight', 'kg', 0, 0.1)}
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>How do you feel today?</label>
          <div className={styles.moodGrid}>
            {moodOptions.map(m => (
              <button key={m} type="button" className={`${styles.moodBtn} ${form.mood === m ? styles.moodActive : ''}`} onClick={() => set('mood', m)}>
                <span className={styles.moodEmoji}>{moodEmoji[m]}</span>
                <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="How was your day? Any health notes..." className={styles.textarea} />
        </div>

        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Saving...' : 'Save Metrics'}
        </button>
      </form>
    </div>
  );
}
