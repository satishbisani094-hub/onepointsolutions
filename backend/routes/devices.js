const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all devices
router.get('/', async (req, res) => {
  try {
    const devices = await prisma.device.findMany();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Create a new device
router.post('/', async (req, res) => {
  try {
    const newDevice = await prisma.device.create({
      data: req.body,
    });
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update a device
router.put('/:id', async (req, res) => {
  try {
    const updatedDevice = await prisma.device.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updatedDevice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete a device
router.delete('/:id', async (req, res) => {
  try {
    await prisma.device.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

module.exports = router;
