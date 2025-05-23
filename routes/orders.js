const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create new order
router.post('/book-order', auth, async (req, res) => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Body:', req.body);
  try {
    const { items = [], totalAmount = 0 } = req.body;
    
    const pickupToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const order = new Order({
      customer: req.user.userId,
      items,
      totalAmount,
      pickupToken
    });

    console.log('Generated order number:', order);
    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        pickupToken: order.pickupToken
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get all orders (admin only)
router.get('/admin-getOrders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find()
      .populate('customer', 'name employeeId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get customer's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status (admin only)
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Verify pickup token
router.get('/verify-token/:token', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ pickupToken: req.params.token });
    if (!order) {
      return res.status(404).json({ message: 'No order found' });
    }
    if (order.status === 'delivered') {
      return res.status(200).json({ message: 'Order already delivered', status: 'delivered', order });
    }
    if (order.status === 'ready') {
      return res.status(200).json({ message: 'Pickup approved', status: 'ready', order });
    }
    res.status(200).json({ message: 'Order not ready', status: order.status, order });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
});

module.exports = router;