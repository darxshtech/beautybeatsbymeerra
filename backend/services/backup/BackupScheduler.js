const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Billing = require('../../models/Billing');
const User = require('../../models/User');
const Attendance = require('../../models/Attendance');

class BackupScheduler {
  start() {
    // Run every Sunday at 2:00 AM IST
    cron.schedule('0 2 * * 0', () => {
      console.log('[BACKUP] Starting weekly backup...');
      this.generateBackups();
    }, {
      timezone: 'Asia/Kolkata'
    });
    console.log('[BACKUP] Weekly backup cron started. Next run: Sunday 2:00 AM IST.');
  }

  async generateBackups() {
    try {
      const backupDir = path.join(__dirname, '../../../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

      // 1. Backup Payment Transactions (Billing)
      const billings = await Billing.find({}).lean();
      fs.writeFileSync(
        path.join(backupDir, `payment-transactions-${timestamp}.json`),
        JSON.stringify(billings, null, 2)
      );

      // 2. Backup Customers
      const customers = await User.find({ role: 'CUSTOMER' }).lean();
      fs.writeFileSync(
        path.join(backupDir, `customers-${timestamp}.json`),
        JSON.stringify(customers, null, 2)
      );

      // 3. Backup Employee Attendance
      const attendance = await Attendance.find({}).lean();
      fs.writeFileSync(
        path.join(backupDir, `attendance-${timestamp}.json`),
        JSON.stringify(attendance, null, 2)
      );

      console.log(`[BACKUP] Weekly backups successfully generated in ${backupDir}`);
    } catch (err) {
      console.error('[BACKUP] Error generating backups:', err);
    }
  }
}

module.exports = new BackupScheduler();
