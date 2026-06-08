const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks (deliveries and pickups)
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        customer: true,
        device: true,
        assigned_staff: true
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get schedule conflicts (Clash Detection)
router.get('/conflicts', async (req, res) => {
  try {
    // A conflict is when a staff member has multiple pending/assigned tasks scheduled within 2 hours of each other.
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: ['Pending', 'Assigned', 'InProgress'] },
        assigned_staff_id: { not: null }
      },
      include: {
        assigned_staff: true,
        customer: true
      },
      orderBy: { scheduled_time: 'asc' }
    });

    const conflicts = [];
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    // Group tasks by staff
    const tasksByStaff = tasks.reduce((acc, task) => {
      if (!acc[task.assigned_staff_id]) acc[task.assigned_staff_id] = [];
      acc[task.assigned_staff_id].push(task);
      return acc;
    }, {});

    // Check overlaps
    for (const staffId in tasksByStaff) {
      const staffTasks = tasksByStaff[staffId];
      for (let i = 0; i < staffTasks.length - 1; i++) {
        for (let j = i + 1; j < staffTasks.length; j++) {
          const t1 = staffTasks[i];
          const t2 = staffTasks[j];
          const diffMs = Math.abs(new Date(t1.scheduled_time) - new Date(t2.scheduled_time));
          
          if (diffMs < TWO_HOURS_MS) {
            conflicts.push({
              staff: t1.assigned_staff.name,
              task1: `${t1.type} for ${t1.customer?.name} at ${new Date(t1.scheduled_time).toLocaleTimeString()}`,
              task2: `${t2.type} for ${t2.customer?.name} at ${new Date(t2.scheduled_time).toLocaleTimeString()}`,
              message: `Double-booked! Tasks are scheduled too close together.`
            });
          }
        }
      }
    }

    res.json(conflicts);
  } catch (error) {
    console.error('Clash detection error:', error);
    res.status(500).json({ error: 'Failed to detect clashes' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { type, priority, scheduled_time, location_address, customer_id, device_id, assigned_staff_id, notes } = req.body;
    const newTask = await prisma.task.create({
      data: {
        type,
        priority,
        scheduled_time: new Date(scheduled_time),
        location_address,
        notes,
        customer_id: parseInt(customer_id),
        device_id: parseInt(device_id),
        assigned_staff_id: assigned_staff_id ? parseInt(assigned_staff_id) : null,
        status: assigned_staff_id ? 'Assigned' : 'Pending'
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

module.exports = router;
