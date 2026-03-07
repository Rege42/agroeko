import mongoose from 'mongoose';

const cropRotationEntrySchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    seasonYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    sowingDate: {
      type: Date,
    },
    harvestDate: {
      type: Date,
    },
    predictedYield: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalYield: {
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
    seasonStatus: {
      type: String,
      enum: ['planned', 'active', 'harvested', 'closed'],
      default: 'planned',
    },
    notes: {
      type: String,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cropRotationEntrySchema.index({ field: 1, seasonYear: 1 }, { unique: true });
cropRotationEntrySchema.index({ crop: 1, seasonYear: 1 });

export default mongoose.model('CropRotationEntry', cropRotationEntrySchema);