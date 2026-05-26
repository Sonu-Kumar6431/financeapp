const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

// Runs daily at 8:00 AM
const startReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily reminder check...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      // Find unnotified reminders due within 3 days
      const upcoming = await Reminder.find({
        dueDate: { $gte: today, $lte: threeDaysLater },
        isPaid: false,
        notified: false,
      }).populate('userId', 'name email');

      console.log(`📅 Found ${upcoming.length} upcoming reminders`);

      for (const reminder of upcoming) {
        // Mark as notified
        reminder.notified = true;
        await reminder.save();

        // In production: send email via nodemailer
        // For hackathon: just log it (add email later)
        console.log(
          `🔔 Reminder: ${reminder.title} - ₹${reminder.amount} due ${reminder.dueDate.toDateString()} for ${reminder.userId?.email}`
        );
      }
    } catch (error) {
      console.error('Reminder job error:', error);
    }
  });

  console.log('✅ Reminder cron job started');
};

module.exports = { startReminderJob };
