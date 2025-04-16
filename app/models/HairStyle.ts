import mongoose from 'mongoose';

const HairStyleSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.HairStyle || mongoose.model('HairStyle', HairStyleSchema); 