import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2 } from 'lucide-react';
import styles from './LogMetric.module.css';

const today = new Date().toISOString().split('T')[0];
const moodOptions = ['great', 'good', 'okay', 'bad', 'terrible'];
const moodEmoji = { great: '😄', good: '🙂', okay: '😐', bad: '😔', terrible: '😢' };

const EXERCISE_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Other'];
const sumCalories = (exs) => exs.reduce((s, ex) => s + (parseFloat(ex.calories) || 0), 0);

const emptyForm = {
  date: today,
  steps: '', waterLiters: '', caloriesBurned: '', caloriesConsumed: '',
  sleepHours: '', weight: '', mood: 'good', notes: '',
  breakfastCal: '', lunchCal: '', dinnerCal: '', snackCal: '',
  exercises: [],
};

export default function LogMetric() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/metrics/${form.date}`)
      .then(r => {
        const d = r.data;
        setForm(prev => ({
          ...prev,
          steps: d.steps || '', waterLiters: d.waterLiters || '',
          caloriesBurned: d.caloriesBurned || '', caloriesConsumed: d.caloriesConsumed || '',
          sleepHours: d.sleepHours || '', weight: d.weight || '', mood: d.mood || 'good',
          notes: d.notes || '', breakfastCal: d.breakfastCal || '',
          lunchCal: d.lunchCal || '', dinnerCal: d.dinnerCal || '',
          snackCal: d.snackCal || '', exercises: d.exercises || [],
        }));
      })
      .catch(() => setForm(prev => ({ ...emptyForm, date: prev.date })));
  }, [form.date]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addWater = (amount) => {
    const current = parseFloat(form.waterLiters) || 0;
    set('waterLiters', (current + amount).toFixed(2));
  };

  const updateMeal = (key, val) => {
    const updated = { ...form, [key]: val };
    const total = ['breakfastCal', 'lunchCal', 'dinnerCal', 'snackCal']
      .reduce((sum, k) => sum + (parseFloat(updated[k]) || 0), 0);
    setForm(prev => ({ ...prev, [key]: val, caloriesConsumed: total || '' }));
  };

  const addExercise = () =>
    setForm(prev => ({ ...prev, exercises: [...prev.exercises, { name: 'Running', duration: '', calories: '' }] }));

  const updateExercise = (i, field, val) =>
    setForm(prev => {
      const exercises = [...prev.exercises];
      exercises[i] = { ...exercises[i], [field]: val };
      return { ...prev, exercises, caloriesBurned: sumCalories(exercises) || '' };
    });

  const removeExercise = (i) =>
    setForm(prev => {
      const exercises = prev.exercises.filter((_, idx) => idx !== i);
      return { ...prev, exercises, caloriesBurned: sumCalories(exercises) || '' };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/metrics', {
        ...form,
        steps: Number(form.steps) || 0,
        waterLiters: Number(form.waterLiters) || 0,
        caloriesBurned: Number(form.caloriesBurned) || 0,
        caloriesConsumed: Number(form.caloriesConsumed) || 0,
        sleepHours: Number(form.sleepHours) || 0,
        weight: form.weight ? Number(form.weight) : undefined,
        breakfastCal: Number(form.breakfastCal) || 0,
        lunchCal: Number(form.lunchCal) || 0,
        dinnerCal: Number(form.dinnerCal) || 0,
        snackCal: Number(form.snackCal) || 0,
        exercises: form.exercises.map(ex => ({ ...ex, duration: Number(ex.duration) || 0, calories: Number(ex.calories) || 0 })),
      });
      setSuccess('Health metrics saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const numField = (key, label, unit, step = 1) => (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.inputWrap}>
        <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} min={0} step={step} placeholder="0" />
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

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Activity & Body</label>
          <div className={styles.grid}>
            {numField('steps', 'Steps', 'steps', 100)}
            {numField('sleepHours', 'Sleep', 'hrs', 0.5)}
            {numField('weight', 'Weight', 'kg', 0.1)}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Water Intake</label>
          <div className={styles.waterRow}>
            <div className={styles.inputWrap} style={{ flex: 1 }}>
              <input type="number" value={form.waterLiters} onChange={e => set('waterLiters', e.target.value)} min={0} step={0.1} placeholder="0.0" />
              <span className={styles.unit}>L</span>
            </div>
            <div className={styles.quickBtns}>
              {[0.25, 0.5, 0.75, 1].map(amt => (
                <button key={amt} type="button" className={styles.quickBtn} onClick={() => addWater(amt)}>+{amt}L</button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Meals (auto-sums to calories consumed)</label>
          <div className={styles.grid}>
            {[['breakfastCal','Breakfast'],['lunchCal','Lunch'],['dinnerCal','Dinner'],['snackCal','Snacks']].map(([key, label]) => (
              <div className={styles.field} key={key}>
                <label>{label}</label>
                <div className={styles.inputWrap}>
                  <input type="number" value={form[key]} onChange={e => updateMeal(key, e.target.value)} min={0} step={10} placeholder="0" />
                  <span className={styles.unit}>kcal</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            Total Consumed: <strong>{Number(form.caloriesConsumed) || 0} kcal</strong>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <label className={styles.sectionLabel}>Exercise Log (auto-sums calories burned)</label>
            <button type="button" className={styles.addBtn} onClick={addExercise}><Plus size={14} /> Add Exercise</button>
          </div>
          {form.exercises.length === 0 && (
            <div className={styles.emptyExercise}>No exercises logged. Click "Add Exercise" to start.</div>
          )}
          {form.exercises.map((ex, i) => (
            <div key={i} className={styles.exerciseRow}>
              <select value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} className={styles.exSelect}>
                {EXERCISE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <div className={styles.inputWrap}>
                <input type="number" value={ex.duration} onChange={e => updateExercise(i, 'duration', e.target.value)} min={0} placeholder="0" />
                <span className={styles.unit}>min</span>
              </div>
              <div className={styles.inputWrap}>
                <input type="number" value={ex.calories} onChange={e => updateExercise(i, 'calories', e.target.value)} min={0} placeholder="0" />
                <span className={styles.unit}>kcal</span>
              </div>
              <button type="button" className={styles.removeBtn} onClick={() => removeExercise(i)}><Trash2 size={15} /></button>
            </div>
          ))}
          {form.exercises.length > 0 && (
            <div className={styles.totalRow}>
              Total Burned: <strong>{Number(form.caloriesBurned) || 0} kcal</strong>
            </div>
          )}
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
        <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Saving...' : 'Save Metrics'}</button>
      </form>
    </div>
  );
}
