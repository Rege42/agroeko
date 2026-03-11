import mongoose from "mongoose";
import {
  Field,
  SoilAnalysis,
  WeatherObservation,
  Crop,
  CropRotationEntry,
  Recommendation,
  Fertilizer,
  PlantProtectionProduct,
  TechnologyTemplate,
  AgroPlan,
  AgroPlanStep,
  FieldOperationLog,
  Sale,
  Cost,
  Procurement,
  LabourCost,
  Plan,
  CropRotationGroup,
  CropCompatibilityRule,
  User,
} from "../models/index.js";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export const createCollections = async () => {
  const models = [
    Field,
    SoilAnalysis,
    WeatherObservation,
    Crop,
    CropRotationEntry,
    Recommendation,
    Fertilizer,
    PlantProtectionProduct,
    TechnologyTemplate,
    AgroPlan,
    AgroPlanStep,
    FieldOperationLog,
    Sale,
    Cost,
    Procurement,
    LabourCost,
    Plan,
    CropRotationGroup,
    CropCompatibilityRule,
    User,
  ];

  for (const model of models) {
    try {
      await model.createCollection();
      await model.init();
      console.log(`Collection ready: ${model.collection.name}`);
    } catch (error) {
      if (error.codeName === "NamespaceExists") {
        console.log(`Collection already exists: ${model.collection.name}`);
      } else {
        console.error(
          `Error creating collection ${model.modelName}:`,
          error.message,
        );
      }
    }
  }
};
