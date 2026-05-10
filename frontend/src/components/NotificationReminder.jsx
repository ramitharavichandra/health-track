import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import styles from './NotificationReminder.module.css';

const STORAGE_KEY = 'ht_reminder_time';

export default function NotificationReminder() {
  const [permission, setPermission] = useState(Notification.permission);
  const [reminderTime, setReminderTime] = useState(localStorage.getItem(STORAGE_KEY) || '20:00');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (permission !== 'granted') return;
    const interval = setInterval(() => {
      const now = new Date();
      const [h, m] = reminderTime.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        new Notification('HealthTrack Reminder', {
          body: "Don't forget to log your health metrics for today!",
          icon: '/favicon.svg',
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [permission, reminderTime]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const saveReminder = () => {
    localStorage.setItem(STORAGE_KEY, reminderTime);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!show) {
    return (
      <button className={styles.bellBtn} onClick={() => setShow(true)} title="Set daily reminder">
        <Bell size={18} color={permission === 'granted' ? '#10b981' : '#94a3b8'} />
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Daily Reminder</span>
        <button onClick={() => setShow(false)} className={styles.closeBtn}><X size={14} /></button>
      </div>
      {permission !== 'granted' ? (
        <div className={styles.body}>
          <p>Enable notifications to get a daily reminder to log your metrics.</p>
          <button className={styles.enableBtn} onClick={requestPermission}>Enable Notifications</button>
        </div>
      ) : (
        <div className={styles.body}>
          <p>Remind me daily at:</p>
          <div className={styles.timeRow}>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className={styles.timeInput} />
            <button className={styles.saveBtn} onClick={saveReminder}>{saved ? 'Saved!' : 'Save'}</button>
          </div>
          <button className={styles.disableBtn} onClick={() => { setPermission('denied'); setShow(false); }}>
            <BellOff size={13} /> Disable
          </button>
        </div>
      )}
    </div>
  );
}
