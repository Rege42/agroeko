import mongoose from 'mongoose';

const soilAnalysisSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    analysisDate: {
      type: Date,
      required: true,
    },
    phLevel: {
      type: Number,
      min: 0,
      max: 14,
      required: true,
    },
    nutrientLevel: {
      type: Number,
      min: 0,
      required: true,
    },
    organicMatterContent: {
      type: Number,
      min: 0,
      required: true,
    },
    soilMoisture: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    nitrogen: {
      type: Number,
      min: 0,
      default: 0,
    },
    phosphorus: {
      type: Number,
      min: 0,
      default: 0,
    },
    potassium: {
      type: Number,
      min: 0,
      default: 0,
    },
    conclusion: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

soilAnalysisSchema.index({ field: 1, analysisDate: -1 });

export default mongoose.model('SoilAnalysis', soilAnalysisSchema);