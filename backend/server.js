const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Import routes
const taskRoutes = require('./routes/tasks');
const deviceRoutes = require('./routes/devices');
const customerRoutes = require('./routes/customers');
const staffRoutes = require('./routes/staff');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activitylog');

// Use routes
app.use('/api/tasks', taskRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Delayed task checker - runs on startup and then every 15 minutes
async function checkDelayedTasks() {
  try {
    const now = new Date();
    const result = await prisma.task.updateMany({
      where: {
        status: { in: ['Pending', 'Assigned'] },
        scheduled_time: { lt: now }
      },
      data: { status: 'Delayed' }
    });
    if (result.count > 0) {
      console.log(`[Delayed Check] Marked ${result.count} task(s) as Delayed`);
    }
  } catch (error) {
    console.error('[Delayed Check] Error:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Run delayed check on startup
  await checkDelayedTasks();
  
  // Run every 15 minutes
  setInterval(checkDelayedTasks, 15 * 60 * 1000);
});
