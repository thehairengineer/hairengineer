import mongoose from 'mongoose';

const AvailableDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  maxAppointments: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  currentAppointments: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

export default mongoose.models.AvailableDate || mongoose.model('AvailableDate', AvailableDateSchema); 