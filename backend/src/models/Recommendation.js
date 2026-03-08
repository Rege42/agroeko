import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    seasonYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    basis: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    status: {
      type: String,
      enum: ['generated', 'approved', 'rejected'],
      default: 'generated',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

recommendationSchema.index({ field: 1, seasonYear: 1, crop: 1 });

export default mongoose.model('Recommendation', recommendationSchema);