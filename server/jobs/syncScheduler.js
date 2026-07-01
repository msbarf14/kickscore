import cron from 'node-cron';
import axios from 'axios';

let syncTask = null;

const PORT = process.env.PORT || 3001;
const SYNC_INTERVAL = process.env.SYNC_INTERVAL_MINUTES || 30;
const TZ = process.env.TIMEZONE || 'Asia/Jakarta';

async function triggerSync() {
  try {
    console.log(`[Scheduler] Triggering auto-sync at ${new Date().toISOString()}`);

    const res = await axios.post(`http://localhost:${PORT}/api/sync/matches`, {}, {
      timeout: 120000
    });

    if (res.data.success) {
      console.log(`[Scheduler] Sync successful: ${res.data.synced} matches from ${res.data.source}`);
    } else {
      console.warn('[Scheduler] Sync returned non-success:', res.data);
    }
  } catch (error) {
    console.error('[Scheduler] Sync failed:', error.message);
  }
}

export function startSyncScheduler() {
  const hasFootballData = !!process.env.FOOTBALL_DATA_TOKEN;
  const hasApiFootball = !!process.env.API_FOOTBALL_KEY;

  if (!hasFootballData && !hasApiFootball) {
    console.warn('[Scheduler] No API tokens found. Auto-sync disabled.');
    console.warn('[Scheduler] Set FOOTBALL_DATA_TOKEN or API_FOOTBALL_KEY in .env to enable auto-sync.');
    return;
  }

  const sources = [];
  if (hasFootballData) sources.push('football-data.org');
  if (hasApiFootball) sources.push('api-football.com');
  console.log(`[Scheduler] API sources available: ${sources.join(', ')}`);

  const cronPattern = `*/${SYNC_INTERVAL} * * * *`;

  if (!cron.validate(cronPattern)) {
    console.error(`[Scheduler] Invalid cron pattern: ${cronPattern}`);
    return;
  }

  syncTask = cron.schedule(cronPattern, triggerSync, {
    scheduled: true,
    timezone: TZ
  });

  console.log(`[Scheduler] Auto-sync enabled: every ${SYNC_INTERVAL} minutes`);
  console.log(`[Scheduler] Next sync will run at the ${SYNC_INTERVAL}-minute mark`);

  setTimeout(() => {
    console.log('[Scheduler] Running initial sync...');
    triggerSync();
  }, 5000);
}

export function stopSyncScheduler() {
  if (syncTask) {
    syncTask.stop();
    syncTask = null;
    console.log('[Scheduler] Auto-sync stopped');
  }
}
