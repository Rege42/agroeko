import mongoose from 'mongoose';

const plantProtectionProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      unique: true,
    },
    targetPurpose: {
      type: String,
      required: true,
      maxlength: 300,
    },
    category: {
      type: String,
      enum: ['herbicide', 'fungicide', 'insecticide', 'growth_regulator', 'other'],
      default: 'other',
    },
    dosage: {
      type: Number,
      min: 0,
      default: 0,
    },
    dosageUnit: {
      type: String,
      default: 'l/ha',
      trim: true,
      maxlength: 20,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

plantProtectionProductSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('PlantProtectionProduct', plantProtectionProductSchema);