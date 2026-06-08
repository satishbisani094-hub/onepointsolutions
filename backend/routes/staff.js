const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all staff members (Users with role DeliveryStaff, Coordinator, etc.)
router.get('/', async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['DeliveryStaff', 'Coordinator'] }
      },
      include: {
        staffDetails: true,
        tasks: true // to get workload
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
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

module.exports = router;
