const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// Create a new menu item
router.post('/create-menu', auth, async (req, res) => {
  try {
    const { name, description, category, image, location, price } = req.body;
    const menuItem = new Menu({ name, description, category, image, location, price });
    await menuItem.save();
    res.status(201).json({ message: 'Menu item created', menuItem });
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item', error });
  }
});

// Get all menu items, optionally filter by location
router.get('/get-menu', async (req, res) => {
  try {
    const { location } = req.query;
    let query = {};
    if (location) {
      query.location = location;
    }
    const menuItems = await Menu.find(query);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error });
  }
});

// Update a menu item by ID
router.put('/update/:id', auth, async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item updated', menuItem: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item', error });
  }
});

// Delete a menu item by ID
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error });
  }
});

router.get('/get-location', async (req, res) => {
  try {
    const locations = await Menu.distinct('location');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
});

// Create multiple menu items
router.post('/create-multiple-menu', auth, async (req, res) => {
  try {
    const menuItemsData = req.body.menuItems; // Expecting an array of menu items
    const menuItems = await Menu.insertMany(menuItemsData);
    res.status(201).json({ message: 'Menu items created', menuItems });
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu items', error });
  }
});

module.exports = router;