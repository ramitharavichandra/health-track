import { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './History.module.css';

const moodEmoji = { great: '😄', good: '🙂', okay: '😐', bad: '😔', terrible: '😢' };

export default function History() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/metrics?limit=30')
      .then(r => setMetrics(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (date) => {
    if (!confirm(`Delete entry for ${date}?`)) return;
    await api.delete(`/metrics/${date}`);
    setMetrics(prev => prev.filter(m => m.date !== date));
  };

  if (loading) return <div className={styles.loading}>Loading history...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Health History</h2>
        <p>Last 30 days of logged data</p>
      </div>

      {metrics.length === 0 ? (
        <div className={styles.empty}>No data logged yet. Start tracking your health!</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Steps</span>
            <span>Water</span>
            <span>Cal Burned</span>
            <span>Cal Consumed</span>
            <span>Sleep</span>
            <span>Weight</span>
            <span>Mood</span>
            <span></span>
          </div>
          {metrics.map(m => (
            <div key={m._id} className={styles.tableRow}>
              <span className={styles.date}>{m.date}</span>
              <span>{m.steps?.toLocaleString() || '—'}</span>
              <span>{m.waterLiters ? `${m.waterLiters}L` : '—'}</span>
              <span>{m.caloriesBurned ? `${m.caloriesBurned} kcal` : '—'}</span>
              <span>{m.caloriesConsumed ? `${m.caloriesConsumed} kcal` : '—'}</span>
              <span>{m.sleepHours ? `${m.sleepHours} hrs` : '—'}</span>
              <span>{m.weight ? `${m.weight} kg` : '—'}</span>
              <span>{moodEmoji[m.mood] || '—'}</span>
              <button className={styles.deleteBtn} onClick={() => handleDelete(m.date)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
