import mongoose from 'mongoose';

const agroPlanStepSchema = new mongoose.Schema(
  {
    agroPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgroPlan',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    stepType: {
      type: String,
      enum: ['soil_preparation', 'sowing', 'fertilizing', 'protection', 'monitoring', 'harvesting', 'other'],
      default: 'other',
    },
    plannedDate: {
      type: Date,
    },
    actualDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped', 'overdue'],
      default: 'pending',
    },
    deviationReason: {
      type: String,
      maxlength: 1000,
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

agroPlanStepSchema.index({ agroPlan: 1, order: 1 }, { unique: true });

export default mongoose.model('AgroPlanStep', agroPlanStepSchema);