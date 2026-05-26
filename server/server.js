require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startReminderJob } = require('./services/reminderJob');

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Start cron jobs after DB is connected
  startReminderJob();
};
app.use('/', (req, res) => {
    res.send('Hello');
});

startServer();
