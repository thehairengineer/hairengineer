import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema(
  {
    paymentRequired: {
      type: Boolean,
      default: true,
      description: 'Whether payment is required to book an appointment'
    },
    paymentTimeoutMinutes: {
      type: Number,
      default: 10,
      description: 'How many minutes to wait for payment verification before timeout'
    },
    defaultAppointmentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      description: 'Default status for new appointments'
    },
    defaultPrice: {
      type: Number,
      default: 2,
      description: 'Default price for services when not specified'
    }
  },
  {
    timestamps: true,
  }
);

// Add a static method to get the current settings
SystemSettingsSchema.statics.getCurrentSettings = async function() {
  // Always return the first document or create one with defaults if none exists
  const settings = await this.findOne({});
  if (settings) {
    return settings;
  }
  
  return await this.create({});
};

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema); 