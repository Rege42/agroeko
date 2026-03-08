import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['grain', 'legume', 'oilseed', 'technical', 'vegetable', 'forage', 'other'],
    },
    growthPeriodDays: {
      type: Number,
      required: true,
      min: 1,
    },
    averageYield: {
      type: Number,
      min: 0,
      default: 0,
    },
    yieldUnit: {
      type: String,
      default: 't/ha',
      trim: true,
      maxlength: 20,
    },
    suitableSoilTypes: {
      type: [String],
      default: [],
      enum: ['chernozem', 'sandy', 'clay', 'loam', 'peat', 'saline', 'other'],
    },
    minRecommendedPh: {
      type: Number,
      min: 0,
      max: 14,
    },
    maxRecommendedPh: {
      type: Number,
      min: 0,
      max: 14,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cropSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Crop', cropSchema);