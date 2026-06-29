const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = require('../prismaClient');

// Get all staff members
router.get('/', async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['DeliveryStaff', 'Coordinator'] }
      },
      include: {
        staffDetails: true,
        tasks: {
          where: { status: { in: ['Pending', 'Assigned', 'InProgress'] } }
        }
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Create a new staff member
router.post('/', async (req, res) => {
  try {
    const { name, email, role, phone, availability_status } = req.body;
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: bcrypt.hashSync('defaulthash', 10),
        role: role || 'DeliveryStaff',
        staffDetails: {
          create: {
            phone: phone || '',
            availability_status: availability_status || 'Available'
          }
        }
      },
      include: { staffDetails: true, tasks: true }
    });
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update staff member
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, phone, availability_status } = req.body;
    const userId = parseInt(req.params.id);

    // Update user
    const userData = {};
    if (name) userData.name = name;
    if (email) userData.email = email;
    if (role) userData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData
    });

    // Update staff details
    if (phone !== undefined || availability_status !== undefined) {
      const staffData = {};
      if (phone !== undefined) staffData.phone = phone;
      if (availability_status) staffData.availability_status = availability_status;

      await prisma.staffDetails.upsert({
        where: { user_id: userId },
        update: staffData,
        create: {
          user_id: userId,
          phone: phone || '',
          availability_status: availability_status || 'Available'
        }
      });
    }

    // Return full staff object
    const fullStaff = await prisma.user.findUnique({
      where: { id: userId },
      include: { staffDetails: true, tasks: true }
    });

    res.json(fullStaff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Update staff availability
router.put('/:id/availability', async (req, res) => {
  try {
    const { availability_status } = req.body;
    const updatedStaffDetails = await prisma.staffDetails.update({
      where: { user_id: parseInt(req.params.id) },
      data: { availability_status },
    });
    res.json(updatedStaffDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff availability' });
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check for active tasks
    const activeTasks = await prisma.task.findMany({
      where: { 
        assigned_staff_id: userId,
        status: { in: ['Pending', 'Assigned', 'InProgress'] }
      }
    });
    
    if (activeTasks.length > 0) {
      return res.status(400).json({ error: 'Cannot delete staff with active tasks. Reassign tasks first.' });
    }

    // Delete in order: notifications, activity logs, staff details, then user
    await prisma.notification.deleteMany({ where: { user_id: userId } });
    await prisma.activityLog.deleteMany({ where: { user_id: userId } });
    await prisma.staffDetails.deleteMany({ where: { user_id: userId } });
    await prisma.user.delete({ where: { id: userId } });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;
