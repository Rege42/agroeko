import mongoose from 'mongoose';

const agroPlanSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    cropRotationEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropRotationEntry',
      required: true,
      unique: true,
    },
    recommendation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recommendation',
    },
    technologyTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TechnologyTemplate',
    },
    plannedStartDate: {
      type: Date,
    },
    plannedEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
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

agroPlanSchema.index({ field: 1, status: 1 });

export default mongoose.model('AgroPlan', agroPlanSchema);