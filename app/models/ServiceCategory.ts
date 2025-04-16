import mongoose from 'mongoose';

const ServiceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // Store categories in uppercase for consistency
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', ServiceCategorySchema); 