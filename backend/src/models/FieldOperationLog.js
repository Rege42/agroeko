import mongoose from 'mongoose';

const resourceUsageSchema = new mongoose.Schema(
  {
    fertilizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fertilizer',
    },
    plantProtectionProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantProtectionProduct',
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 30,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const fieldOperationLogSchema = new mongoose.Schema(
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
    },
    agroPlanStep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgroPlanStep',
    },
    operationDate: {
      type: Date,
      required: true,
      index: true,
    },
    operationType: {
      type: String,
      required: true,
      enum: ['soil_preparation', 'sowing', 'fertilizing', 'spraying', 'inspection', 'harvesting', 'other'],
    },
    description: {
      type: String,
      maxlength: 3000,
    },
    resourceUsages: {
      type: [resourceUsageSchema],
      default: [],
    },
    resultSummary: {
      type: String,
      maxlength: 2000,
    },
    soilConditionAfter: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

fieldOperationLogSchema.index({ field: 1, operationDate: -1 });

export default mongoose.model('FieldOperationLog', fieldOperationLogSchema);