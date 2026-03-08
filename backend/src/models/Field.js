import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    area: {
      type: Number,
      required: true,
      min: 0.01,
    },
    soilType: {
      type: String,
      required: true,
      enum: ['chernozem', 'sandy', 'clay', 'loam', 'peat', 'saline', 'other'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    moistureLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    cadastralNumber: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

fieldSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Field', fieldSchema);