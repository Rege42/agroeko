import dotenv from 'dotenv';
import app from './app.js';
import { connectDb } from './config/db.js';
import { seedData } from './config/seed.js';
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
} from './models/index.js';
import { seedUsers } from './config/seedUsers.js';
import seedAnalytics from './config/seed-analytics.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const createCollections = async () => {
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
];

  for (const model of models) {
    try {
      await model.createCollection();
      await model.init();
      console.log(`Collection ready: ${model.collection.name}`);
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log(`Collection already exists: ${model.collection.name}`);
      } else {
        console.error(`Error creating collection ${model.modelName}:`, error.message);
      }
    }
  }
};

const startServer = async () => {
  try {
    await connectDb();
    await createCollections();
    await seedData();
    await seedUsers();
    await seedAnalytics();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();