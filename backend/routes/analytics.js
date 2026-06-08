const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/dashboard', async (req, res) => {
  try {
    // 1. Get total counts
    const totalDeliveries = await prisma.task.count({ where: { type: 'Delivery' } });
    const activePickups = await prisma.task.count({ where: { type: 'Pickup', status: { not: 'Completed' } } });
    const delayedTasks = await prisma.task.count({ where: { status: 'Delayed' } });
    const completedToday = await prisma.task.count({ 
      where: { 
        status: 'Completed',
        updated_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      } 
    });

    // 2. Get task status distribution for pie chart
    const statuses = ['Pending', 'Assigned', 'InProgress', 'Completed', 'Delayed', 'Cancelled'];
    const pieData = await Promise.all(statuses.map(async (status) => {
      const count = await prisma.task.count({ where: { status } });
      const colors = {
        'Completed': '#10b981',
        'InProgress': '#3b82f6',
        'Pending': '#f59e0b',
        'Delayed': '#ef4444',
        'Assigned': '#8b5cf6',
        'Cancelled': '#64748b'
      };
      return { name: status, value: count, color: colors[status] };
    }));

    // Filter out 0 values for cleaner pie chart
    const filteredPieData = pieData.filter(d => d.value > 0);

    // 3. Get recent activities (last 5 tasks updated)
    const recentTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: { customer: true }
    });

    const recentActivities = recentTasks.map(t => ({
      id: t.id,
      title: `${t.type} ${t.status}`,
      desc: `${t.type} for ${t.customer?.name} is currently ${t.status}.`,
      time: new Date(t.updated_at).toLocaleString(),
      type: t.status === 'Completed' ? 'success' : t.status === 'Delayed' ? 'warning' : 'info'
    }));

    res.json({
      summary: { totalDeliveries, activePickups, delayedTasks, completedToday },
      pieData: filteredPieData,
      recentActivities
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
