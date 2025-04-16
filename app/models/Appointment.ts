import mongoose from 'mongoose';

// Force clear the model cache to ensure our schema changes take effect
// This pattern is used in large-scale apps to prevent schema caching issues
if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}

const AppointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  snapchat: {
    type: String,
    required: false,
  },
  whatsapp: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  hairColor: {
    type: String,
    required: true,
    default: 'black',
  },
  preferredLength: {
    type: String,
    required: true,
    enum: ['shoulder', 'bra', 'waist', 'butt']
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'full'],
    default: 'unpaid',
  },
  paystackReference: {
    type: String,
    required: false,
    index: true,
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      // Remove enum restriction to support any payment method from Paystack
      // Enumeration forces us to manually update the schema each time a new provider is added
      required: true,
    },
    reference: String,
    note: String
  }]
}, {
  timestamps: true,
});

// Add a pre-save middleware to automatically update payment status
AppointmentSchema.pre('save', function(next) {
  if (this.amountPaid === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.amountPaid < this.totalAmount) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'full';
  }
  next();
});

export default mongoose.model('Appointment', AppointmentSchema);