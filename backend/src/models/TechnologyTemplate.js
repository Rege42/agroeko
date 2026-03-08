import mongoose from 'mongoose';

const technologyStepSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    stepType: {
      type: String,
      enum: ['soil_preparation', 'sowing', 'fertilizing', 'protection', 'monitoring', 'harvesting', 'other'],
      default: 'other',
    },
    recommendedOffsetDays: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const technologyTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 3000,
    },
    steps: {
      type: [technologyStepSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

technologyTemplateSchema.index({ name: 1, crop: 1 }, { unique: true });

export default mongoose.model('TechnologyTemplate', technologyTemplateSchema);