import mongoose from "mongoose";

const cropRotationGroupSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["main", "intermediate", "technical", "fodder", "other"],
      default: "main",
    },
    displayOrderRow: {
      type: Number,
      default: 0,
      min: 0,
    },
    displayOrderColumn: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

cropRotationGroupSchema.index({ displayOrderRow: 1 });
cropRotationGroupSchema.index({ displayOrderColumn: 1 });

export default mongoose.model("CropRotationGroup", cropRotationGroupSchema);
