const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    id: { type: String, required: false },
    name: { type: String, required: false },
    price: { type: Number, required: false },
    quantity: {
      type: Number,
      min: 1,
      required: false
    },
    image: { type: String, required: false },
    category: { type: String, required: false },
    description: { type: String, required: false }
  });

const orderSchema = new mongoose.Schema({
  pickupToken: {
    type: String,
    default: null,
    sparse: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: false },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD${String(count + 1).padStart(4, '0')}`;
      console.log('Generated order number:', this.orderNumber);
      next();
    } catch (error) {
      console.error('Error generating order number:', error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);