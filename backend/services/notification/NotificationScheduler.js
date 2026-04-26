const cron = require('node-cron');
const NotificationService = require('./NotificationService');
const SentNotification = require('../../models/SentNotification');

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the cron scheduler.
   * Runs every day at 9:00 AM IST (03:30 UTC).
   * Also runs immediately on boot if it's between 9 AM and 8 PM IST and hasn't run today.
   */
  start() {
    // Schedule daily at 9:00 AM IST = 03:30 UTC
    cron.schedule('30 3 * * *', () => {
      console.log('[SCHEDULER] 9:00 AM IST - Running daily auto-notifications...');
      this.runDailyNotifications();
    }, {
      timezone: 'Asia/Kolkata'
    });

    console.log('[SCHEDULER] Auto-notification cron started. Next run: 9:00 AM IST daily.');

    // Check if we should run now (on boot, if daytime and not already sent today)
    this._checkBootRun();
  }

  /**
   * On server boot, check if it's daytime and notifications haven't been sent today.
   * If so, run them immediately.
   */
  async _checkBootRun() {
    // Get current time in IST
    const istString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const istHour = parseInt(istString.split(', ')[1].split(':')[0]);
    
    // Only auto-run between 9 AM and 8 PM IST
    if (istHour >= 9 && istHour < 20) {
      const todayKey = this._getTodayKey();
      const alreadyRan = await SentNotification.findOne({ 
        notificationKey: { $regex: `^boot-check-${todayKey}` } 
      });
      
      if (!alreadyRan) {
        console.log(`[SCHEDULER] Boot check: It's ${istHour}:xx IST and no notifications sent today. Running now...`);
        await this.runDailyNotifications();
      } else {
        console.log(`[SCHEDULER] Boot check: Notifications already sent today. Skipping.`);
      }
    } else {
      console.log(`[SCHEDULER] Boot check: Outside daytime hours (${istHour}:xx IST). Skipping auto-send.`);
    }
  }

  /**
   * Get today's date key for deduplication (YYYY-MM-DD in IST)
   */
  _getTodayKey() {
    const now = new Date();
    // Convert to IST by adding 5:30
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.toISOString().split('T')[0];
  }

  /**
   * Main function: Fetch all pending notifications, send them via WhatsApp, 
   * and record each one to prevent duplicates.
   */
  async runDailyNotifications() {
    if (this.isRunning) {
      console.log('[SCHEDULER] Already running. Skipping duplicate execution.');
      return;
    }
    
    this.isRunning = true;
    const todayKey = this._getTodayKey();
    let sent = 0, skipped = 0, failed = 0;

    try {
      // Get all pending notifications
      const result = await NotificationService.getNotifications();
      const notifications = result.data || [];

      console.log(`[SCHEDULER] Found ${notifications.length} pending notifications for ${todayKey}`);

      for (const note of notifications) {
        const notifKey = `${note.id}-${todayKey}`;

        // Check if already sent today
        const existing = await SentNotification.findOne({ notificationKey: notifKey });
        if (existing) {
          skipped++;
          continue;
        }

        // Send the notification
        try {
          const result = await NotificationService.triggerNotification(note.type, note.metadata);
          
          // Record the sent notification
          await SentNotification.create({
            notificationKey: notifKey,
            type: note.type,
            recipient: note.phone,
            status: result.success ? 'SENT' : 'FAILED',
            message: result.message
          });

          if (result.success) {
            sent++;
            console.log(`  ✅ ${note.type}: ${note.customer} (${note.phone})`);
          } else {
            failed++;
            console.log(`  ❌ ${note.type}: ${note.customer} - ${result.message}`);
          }
        } catch (err) {
          failed++;
          console.error(`  ❌ ${note.type}: ${note.customer} - Error: ${err.message}`);
          
          // Still record it as failed to prevent retry loops
          await SentNotification.create({
            notificationKey: notifKey,
            type: note.type,
            recipient: note.phone,
            status: 'FAILED',
            message: err.message
          }).catch(() => {});
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Record boot check marker
      await SentNotification.create({
        notificationKey: `boot-check-${todayKey}`,
        type: 'SYSTEM',
        status: 'SENT',
        message: `Daily run complete: ${sent} sent, ${skipped} skipped, ${failed} failed`
      }).catch(() => {});

      console.log(`[SCHEDULER] Daily run complete: ${sent} sent, ${skipped} skipped, ${failed} failed`);
    } catch (err) {
      console.error('[SCHEDULER] Fatal error during daily run:', err.message);
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new NotificationScheduler();
