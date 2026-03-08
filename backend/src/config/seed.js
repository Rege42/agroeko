import { Crop, Field } from '../models/index.js';

export const seedData = async () => {
  const cropExists = await Crop.findOne({ name: 'Пшеница' });
  if (!cropExists) {
    await Crop.create({
      name: 'Пшеница',
      type: 'grain',
      growthPeriodDays: 120,
      averageYield: 4.5,
      yieldUnit: 't/ha',
      suitableSoilTypes: ['chernozem', 'loam'],
      minRecommendedPh: 6,
      maxRecommendedPh: 7.5,
      notes: 'Тестовая культура',
    });

    console.log('Seed inserted: Crop -> Пшеница');
  }

  const fieldExists = await Field.findOne({ name: 'Поле-1' });
  if (!fieldExists) {
    await Field.create({
      name: 'Поле-1',
      area: 120,
      soilType: 'chernozem',
      location: 'Северный участок',
      moistureLevel: 'medium',
      cadastralNumber: 'RU-01-0001',
      notes: 'Тестовое поле',
    });

    console.log('Seed inserted: Field -> Поле-1');
  }
};