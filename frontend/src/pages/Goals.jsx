import { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './Goals.module.css';

export default function Goals() {
  const [form, setForm] = useState({ dailySteps: '', dailyWater: '', dailyCaloriesBurned: '', dailySleep: '', targetWeight: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/goals').then(r => {
      const g = r.data;
      setForm({
        dailySteps: g.dailySteps || '',
        dailyWater: g.dailyWater || '',
        dailyCaloriesBurned: g.dailyCaloriesBurned || '',
        dailySleep: g.dailySleep || '',
        targetWeight: g.targetWeight || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await api.put('/goals', {
        dailySteps: Number(form.dailySteps) || 10000,
        dailyWater: Number(form.dailyWater) || 2.5,
        dailyCaloriesBurned: Number(form.dailyCaloriesBurned) || 500,
        dailySleep: Number(form.dailySleep) || 8,
        targetWeight: form.targetWeight ? Number(form.targetWeight) : undefined,
      });
      setSuccess('Goals updated!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  const field = (key, label, unit, step = 1) => (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.inputWrap}>
        <input type="number" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} min={0} step={step} />
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Health Goals</h2>
        <p>Set your daily targets to track progress on the dashboard</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          {field('dailySteps', 'Daily Steps Goal', 'steps', 500)}
          {field('dailyWater', 'Daily Water Goal', 'L', 0.1)}
          {field('dailyCaloriesBurned', 'Daily Calories Burned', 'kcal', 50)}
          {field('dailySleep', 'Daily Sleep Goal', 'hrs', 0.5)}
          {field('targetWeight', 'Target Weight', 'kg', 0.5)}
        </div>
        {success && <div className={styles.success}>{success}</div>}
        <button type="submit" className={styles.btn} disabled={saving}>{saving ? 'Saving...' : 'Save Goals'}</button>
      </form>
    </div>
  );
}
