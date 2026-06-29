const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Run all database calls in parallel to eliminate sequential roundtrip network latency
    const [
      totalDeliveries,
      activePickups,
      delayedTasks,
      completedToday,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      
      // Pie chart status counts
      pendingPie,
      assignedPie,
      inProgressPie,
      completedPie,
      delayedPie,
      cancelledPie,
      
      // Recent tasks for weekly data
      recentTasks,
      
      // Staff utilization
      staff,
      
      // Device utilization
      totalDevices,
      rentedDevices,
      availableDevices,
      maintenanceDevices,
      
      // Completed tasks for on-time rate
      completedTasks,
      
      // Latest tasks for recent activities
      latestTasks
    ] = await Promise.all([
      prisma.task.count({ where: { type: 'Delivery' } }),
      prisma.task.count({ where: { type: 'Pickup', status: { not: 'Completed' } } }),
      prisma.task.count({ where: { status: 'Delayed' } }),
      prisma.task.count({ 
        where: { 
          status: 'Completed',
          updated_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        } 
      }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'Pending' } }),
      prisma.task.count({ where: { status: 'InProgress' } }),
      
      // Pie status counts
      prisma.task.count({ where: { status: 'Pending' } }),
      prisma.task.count({ where: { status: 'Assigned' } }),
      prisma.task.count({ where: { status: 'InProgress' } }),
      prisma.task.count({ where: { status: 'Completed' } }),
      prisma.task.count({ where: { status: 'Delayed' } }),
      prisma.task.count({ where: { status: 'Cancelled' } }),
      
      // Recent tasks from the last 7 days
      prisma.task.findMany({
        where: {
          scheduled_time: { gte: sevenDaysAgo }
        }
      }),
      
      // Staff list
      prisma.user.findMany({
        where: { role: { in: ['DeliveryStaff', 'Coordinator'] } },
        include: {
          staffDetails: true,
          tasks: {
            where: { status: { in: ['Pending', 'Assigned', 'InProgress'] } }
          }
        }
      }),
      
      // Device counts
      prisma.device.count(),
      prisma.device.count({ where: { availability_status: 'Rented' } }),
      prisma.device.count({ where: { availability_status: 'Available' } }),
      prisma.device.count({ where: { availability_status: 'Maintenance' } }),
      
      // Completed tasks for on-time delivery rate
      prisma.task.findMany({
        where: { status: 'Completed' }
      }),
      
      // Latest tasks for recent activities
      prisma.task.findMany({
        take: 5,
        orderBy: { updated_at: 'desc' },
        include: { customer: true, assigned_staff: true }
      })
    ]);

    // Format Task Status Distribution Pie Chart data
    const colors = {
      'Completed': '#10b981',
      'InProgress': '#3b82f6',
      'Pending': '#f59e0b',
      'Delayed': '#ef4444',
      'Assigned': '#8b5cf6',
      'Cancelled': '#64748b'
    };
    
    const pieData = [
      { name: 'Pending', value: pendingPie, color: colors['Pending'] },
      { name: 'Assigned', value: assignedPie, color: colors['Assigned'] },
      { name: 'InProgress', value: inProgressPie, color: colors['InProgress'] },
      { name: 'Completed', value: completedPie, color: colors['Completed'] },
      { name: 'Delayed', value: delayedPie, color: colors['Delayed'] },
      { name: 'Cancelled', value: cancelledPie, color: colors['Cancelled'] }
    ];
    const filteredPieData = pieData.filter(d => d.value > 0);

    // Format Weekly data
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

    // Format Staff utilization
    const staffUtilization = staff.map(s => ({
      name: s.name,
      activeTasks: s.tasks?.length || 0,
      availability: s.staffDetails?.availability_status || 'Unknown'
    }));

    // Calculate On-time delivery rate
    const onTimeTasks = completedTasks.filter(t => {
      if (!t.actual_time) return true;
      return new Date(t.actual_time) <= new Date(new Date(t.scheduled_time).getTime() + 30 * 60000);
    });
    const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeTasks.length / completedTasks.length) * 100) : 100;

    // Format Recent activities
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
