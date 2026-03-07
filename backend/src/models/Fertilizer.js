import mongoose from 'mongoose';

const fertilizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      unique: true,
    },
    composition: {
      type: String,
      required: true,
      maxlength: 500,
    },
    dosage: {
      type: Number,
      required: true,
      min: 0,
    },
    dosageUnit: {
      type: String,
      default: 'kg/ha',
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

fertilizerSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Fertilizer', fertilizerSchema);