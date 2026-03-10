import mongoose from "mongoose";

const COMPATIBILITY_LEVELS = [
  "EXCELLENT",
  "GOOD",
  "ACCEPTABLE",
  "RISKY",
  "FORBIDDEN",
];

const cropCompatibilityRuleSchema = new mongoose.Schema(
  {
    targetGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CropRotationGroup",
      required: true,
    },
    predecessorGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CropRotationGroup",
      required: true,
    },
    compatibilityLevel: {
      type: String,
      enum: COMPATIBILITY_LEVELS,
      required: true,
    },
    returnPeriodMinYears: {
      type: Number,
      min: 0,
      default: null,
    },
    returnPeriodMaxYears: {
      type: Number,
      min: 0,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

cropCompatibilityRuleSchema.index(
  { targetGroup: 1, predecessorGroup: 1 },
  { unique: true },
);

export default mongoose.model(
  "CropCompatibilityRule",
  cropCompatibilityRuleSchema,
);
