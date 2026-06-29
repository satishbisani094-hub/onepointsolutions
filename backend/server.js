const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const deviceRoutes = require('./routes/devices');
const customerRoutes = require('./routes/customers');
const staffRoutes = require('./routes/staff');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activitylog');

const authMiddleware = require('./middleware/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/staff', authMiddleware, staffRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/activity-logs', authMiddleware, activityLogRoutes);

const clientBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(clientBuildPath));

app.get('/api/db-viewer', async (req, res) => {
  try {
    const data = {
      users: await prisma.user.findMany(),
      customers: await prisma.customer.findMany(),
      devices: await prisma.device.findMany(),
      tasks: await prisma.task.findMany({
        include: {
          customer: true,
          device: true,
          assigned_staff: true
        }
      }),
      notifications: await prisma.notification.findMany(),
      activityLogs: await prisma.activityLog.findMany(),
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.get('/db-viewer', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

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
