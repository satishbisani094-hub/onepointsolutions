const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get recent activity logs
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: { select: { name: true, role: true } }
      }
    });
    
    const total = await prisma.activityLog.count();
    res.json({ logs, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Get activity log for a specific entity
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        entity_type: req.params.type,
        entity_id: parseInt(req.params.id)
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity activity' });
  }
});

module.exports = router;
