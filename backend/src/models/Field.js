import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    area: {
      type: Number,
      required: true,
      min: 0.01,
    },
    soilType: {
      type: String,
      required: true,
      enum: ["chernozem", "sandy", "clay", "loam", "peat", "saline", "other"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    nutrientsLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    cadastralNumber: {
      type: String,
      trim: true,
      maxlength: 64,
    },
    precipitation: {
      type: Number,
      min: 0,
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },
    temperature: {
      type: Number,
    },
    ph: {
      type: Number,
      min: 0,
      max: 14,
    },
    organic: {
      type: Number,
      min: 0,
      max: 100,
    },
    soilMoisture: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

fieldSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Field", fieldSchema);
