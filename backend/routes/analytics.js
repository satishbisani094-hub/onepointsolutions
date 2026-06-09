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
    const totalTasks = await prisma.task.count();
    const pendingTasks = await prisma.task.count({ where: { status: 'Pending' } });
    const inProgressTasks = await prisma.task.count({ where: { status: 'InProgress' } });

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
    const filteredPieData = pieData.filter(d => d.value > 0);

    // 3. Real weekly data - get tasks from the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTasks = await prisma.task.findMany({
      where: {
        scheduled_time: { gte: sevenDaysAgo }
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTasks = recentTasks.filter(t => {
        const st = new Date(t.scheduled_time);
        return st >= dayStart && st <= dayEnd;
      });

      weeklyData.push({
        name: dayNames[dayStart.getDay()],
        deliveries: dayTasks.filter(t => t.type === 'Delivery').length,
        pickups: dayTasks.filter(t => t.type === 'Pickup').length
      });
    }

    // 4. Staff utilization
    const staff = await prisma.user.findMany({
      where: { role: { in: ['DeliveryStaff', 'Coordinator'] } },
      include: {
        staffDetails: true,
        tasks: {
          where: { status: { in: ['Pending', 'Assigned', 'InProgress'] } }
        }
      }
    });
    const staffUtilization = staff.map(s => ({
      name: s.name,
      activeTasks: s.tasks?.length || 0,
      availability: s.staffDetails?.availability_status || 'Unknown'
    }));

    // 5. Device utilization
    const totalDevices = await prisma.device.count();
    const rentedDevices = await prisma.device.count({ where: { availability_status: 'Rented' } });
    const availableDevices = await prisma.device.count({ where: { availability_status: 'Available' } });
    const maintenanceDevices = await prisma.device.count({ where: { availability_status: 'Maintenance' } });

    // 6. On-time delivery rate
    const completedTasks = await prisma.task.findMany({
      where: { status: 'Completed' }
    });
    const onTimeTasks = completedTasks.filter(t => {
      if (!t.actual_time) return true;
      return new Date(t.actual_time) <= new Date(new Date(t.scheduled_time).getTime() + 30 * 60000);
    });
    const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeTasks.length / completedTasks.length) * 100) : 100;

    // 7. Get recent activities (last 5 tasks updated)
    const latestTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: { customer: true, assigned_staff: true }
    });

    const recentActivities = latestTasks.map(t => ({
      id: t.id,
      title: `${t.type} ${t.status}`,
      desc: `${t.type} for ${t.customer?.name || 'N/A'} is currently ${t.status}.${t.assigned_staff ? ` Assigned to ${t.assigned_staff.name}.` : ''}`,
      time: new Date(t.updated_at).toLocaleString(),
      type: t.status === 'Completed' ? 'success' : t.status === 'Delayed' ? 'warning' : 'info'
    }));

    res.json({
      summary: { totalDeliveries, activePickups, delayedTasks, completedToday, totalTasks, pendingTasks, inProgressTasks },
      pieData: filteredPieData,
      weeklyData,
      staffUtilization,
      deviceUtilization: { total: totalDevices, rented: rentedDevices, available: availableDevices, maintenance: maintenanceDevices },
      onTimeRate,
      recentActivities
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
