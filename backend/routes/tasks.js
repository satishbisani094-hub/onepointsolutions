const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, type, staff_id, date_from, date_to } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (staff_id) where.assigned_staff_id = parseInt(staff_id);
    if (date_from || date_to) {
      where.scheduled_time = {};
      if (date_from) where.scheduled_time.gte = new Date(date_from);
      if (date_to) where.scheduled_time.lte = new Date(date_to);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        customer: true,
        device: true,
        assigned_staff: { include: { staffDetails: true } }
      },
      orderBy: { scheduled_time: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get schedule conflicts (Clash Detection)
router.get('/conflicts', async (req, res) => {
  try {
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
          const durationMs = (t1.estimated_duration_mins || 60) * 60 * 1000;
          const diffMs = Math.abs(new Date(t1.scheduled_time) - new Date(t2.scheduled_time));

          if (diffMs < durationMs) {
            conflicts.push({
              staff: t1.assigned_staff.name,
              staffId: parseInt(staffId),
              task1Id: t1.id,
              task2Id: t2.id,
              task1: `${t1.type} for ${t1.customer?.name} at ${new Date(t1.scheduled_time).toLocaleTimeString()}`,
              task2: `${t2.type} for ${t2.customer?.name} at ${new Date(t2.scheduled_time).toLocaleTimeString()}`,
              message: `Double-booked! Tasks overlap within the estimated duration.`
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

// Check clash for a specific staff + time before creating a task
router.post('/check-clash', async (req, res) => {
  try {
    const { assigned_staff_id, scheduled_time, estimated_duration_mins = 60 } = req.body;
    if (!assigned_staff_id || !scheduled_time) {
      return res.json({ hasClash: false, conflicts: [] });
    }

    const targetTime = new Date(scheduled_time);
    const durationMs = estimated_duration_mins * 60 * 1000;

    const existingTasks = await prisma.task.findMany({
      where: {
        assigned_staff_id: parseInt(assigned_staff_id),
        status: { in: ['Pending', 'Assigned', 'InProgress'] }
      },
      include: { customer: true }
    });

    const clashes = existingTasks.filter(t => {
      const diffMs = Math.abs(new Date(t.scheduled_time) - targetTime);
      return diffMs < durationMs;
    });

    res.json({
      hasClash: clashes.length > 0,
      conflicts: clashes.map(t => ({
        id: t.id,
        type: t.type,
        customer: t.customer?.name,
        scheduled_time: t.scheduled_time,
        location: t.location_address
      }))
    });
  } catch (error) {
    console.error('Check clash error:', error);
    res.status(500).json({ error: 'Failed to check clash' });
  }
});

// Auto-assign: find the least loaded available staff
router.get('/auto-assign', async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['DeliveryStaff', 'Coordinator'] },
        staffDetails: {
          availability_status: { in: ['Available', 'On Duty'] }
        }
      },
      include: {
        staffDetails: true,
        tasks: {
          where: { status: { in: ['Pending', 'Assigned', 'InProgress'] } }
        }
      }
    });

    if (staff.length === 0) {
      return res.json({ suggested: null, message: 'No available staff found' });
    }

    // Sort by number of active tasks (least loaded first)
    staff.sort((a, b) => (a.tasks?.length || 0) - (b.tasks?.length || 0));

    res.json({
      suggested: {
        id: staff[0].id,
        name: staff[0].name,
        activeTasks: staff[0].tasks?.length || 0,
        availability: staff[0].staffDetails?.availability_status
      },
      allAvailable: staff.map(s => ({
        id: s.id,
        name: s.name,
        activeTasks: s.tasks?.length || 0,
        availability: s.staffDetails?.availability_status
      }))
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    res.status(500).json({ error: 'Failed to suggest staff' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { type, priority, scheduled_time, location_address, customer_id, device_id, assigned_staff_id, notes, estimated_duration_mins } = req.body;

    // Determine staff - auto-assign if not provided
    let finalStaffId = assigned_staff_id ? parseInt(assigned_staff_id) : null;

    if (!finalStaffId) {
      // Auto-assign to least loaded available staff
      const availableStaff = await prisma.user.findMany({
        where: {
          role: { in: ['DeliveryStaff', 'Coordinator'] },
          staffDetails: { availability_status: { in: ['Available', 'On Duty'] } }
        },
        include: {
          tasks: { where: { status: { in: ['Pending', 'Assigned', 'InProgress'] } } }
        }
      });

      if (availableStaff.length > 0) {
        availableStaff.sort((a, b) => (a.tasks?.length || 0) - (b.tasks?.length || 0));
        finalStaffId = availableStaff[0].id;
      }
    }

    const newTask = await prisma.task.create({
      data: {
        type,
        priority: priority || 'Medium',
        scheduled_time: new Date(scheduled_time),
        location_address,
        notes,
        estimated_duration_mins: estimated_duration_mins || 60,
        customer_id: parseInt(customer_id),
        device_id: parseInt(device_id),
        assigned_staff_id: finalStaffId,
        status: finalStaffId ? 'Assigned' : 'Pending'
      },
      include: {
        customer: true,
        device: true,
        assigned_staff: true
      }
    });

    // Update device status to Rented for Delivery tasks
    if (type === 'Delivery') {
      await prisma.device.update({
        where: { id: parseInt(device_id) },
        data: { availability_status: 'Rented' }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        user_id: finalStaffId || 1,
        action: 'TASK_CREATED',
        entity_type: 'Task',
        entity_id: newTask.id
      }
    });

    // Create notification for assigned staff
    if (finalStaffId) {
      await prisma.notification.create({
        data: {
          user_id: finalStaffId,
          type: 'TASK_ASSIGNED',
          message: `New ${type} task assigned: ${newTask.location_address} for ${newTask.customer?.name}`
        }
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

// Update task (full edit)
router.put('/:id', async (req, res) => {
  try {
    const { type, priority, scheduled_time, location_address, customer_id, device_id, assigned_staff_id, notes, estimated_duration_mins } = req.body;
    const data = {};

    if (type) data.type = type;
    if (priority) data.priority = priority;
    if (scheduled_time) data.scheduled_time = new Date(scheduled_time);
    if (location_address) data.location_address = location_address;
    if (customer_id) data.customer_id = parseInt(customer_id);
    if (device_id) data.device_id = parseInt(device_id);
    if (assigned_staff_id !== undefined) {
      data.assigned_staff_id = assigned_staff_id ? parseInt(assigned_staff_id) : null;
      if (assigned_staff_id) data.status = 'Assigned';
    }
    if (notes !== undefined) data.notes = notes;
    if (estimated_duration_mins) data.estimated_duration_mins = parseInt(estimated_duration_mins);

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { customer: true, device: true, assigned_staff: true }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { device: true } });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        actual_time: status === 'Completed' ? new Date() : undefined
      },
      include: { customer: true, device: true, assigned_staff: true }
    });

    // If Pickup is completed, set device back to Available
    if (status === 'Completed' && task.type === 'Pickup') {
      await prisma.device.update({
        where: { id: task.device_id },
        data: { availability_status: 'Available' }
      });
    }

    // Log the status change
    await prisma.activityLog.create({
      data: {
        user_id: task.assigned_staff_id || 1,
        action: `STATUS_${status.toUpperCase()}`,
        entity_type: 'Task',
        entity_id: taskId
      }
    });

    // Notify assigned staff of status change
    if (task.assigned_staff_id) {
      await prisma.notification.create({
        data: {
          user_id: task.assigned_staff_id,
          type: 'STATUS_UPDATE',
          message: `Task #${taskId} status changed to ${status}`
        }
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    // If device was rented for this task, set back to available
    if (task && task.type === 'Delivery' && task.status !== 'Completed') {
      await prisma.device.update({
        where: { id: task.device_id },
        data: { availability_status: 'Available' }
      });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Check and mark delayed tasks
router.get('/check-delayed', async (req, res) => {
  try {
    const now = new Date();
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { in: ['Pending', 'Assigned', 'InProgress'] },
        scheduled_time: { lt: now }
      }
    });

    const updated = await Promise.all(
      overdueTasks.map(task =>
        prisma.task.update({
          where: { id: task.id },
          data: { status: 'Delayed' }
        })
      )
    );

    res.json({ markedDelayed: updated.length, tasks: updated });
  } catch (error) {
    console.error('Check delayed error:', error);
    res.status(500).json({ error: 'Failed to check delayed tasks' });
  }
});

module.exports = router;
