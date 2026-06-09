const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { tasks: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const newCustomer = await prisma.customer.create({
      data: { name, phone, email, address },
      include: { tasks: true }
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const data = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address) data.address = address;

    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { tasks: true }
    });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    // Check if customer has tasks
    const tasks = await prisma.task.findMany({
      where: { customer_id: parseInt(req.params.id) }
    });
    if (tasks.length > 0) {
      return res.status(400).json({ error: 'Cannot delete customer with existing tasks. Delete their tasks first.' });
    }
    await prisma.customer.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
