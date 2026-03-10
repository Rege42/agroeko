import { Crop, Field, CropRotationGroup } from '../models/index.js';

export const seedData = async () => {
  const grainGroup = await CropRotationGroup.findOneAndUpdate(
    { name: 'Зерновые' },
    {
      $set: {
        code: 'GRAIN',
        name: 'Зерновые',
        displayOrderRow: 1,
        displayOrderColumn: 1,
        isActive: true,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  const technicalGroup = await CropRotationGroup.findOneAndUpdate(
    { name: 'Технические' },
    {
      $set: {
        code: 'TECHNICAL',
        name: 'Технические',
        displayOrderRow: 2,
        displayOrderColumn: 2,
        isActive: true,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('Seed ensured: CropRotationGroups');

  await Crop.findOneAndUpdate(
    { name: 'Пшеница' },
    {
      $set: {
        name: 'Пшеница',
        type: 'grain',
        growthPeriodDays: 120,
        averageYield: 4.5,
        yieldUnit: 't/ha',
        cropRotationGroup: grainGroup._id,
        suitableSoilTypes: ['chernozem', 'loam'],
        minRecommendedPh: 6,
        maxRecommendedPh: 7.5,
        seedingRate: 200,
        notes: 'Тестовая культура',
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  await Crop.findOneAndUpdate(
    { name: 'Рожь' },
    {
      $set: {
        name: 'Рожь',
        type: 'grain',
        growthPeriodDays: 110,
        averageYield: 6,
        yieldUnit: 't/ha',
        cropRotationGroup: grainGroup._id,
        suitableSoilTypes: ['chernozem'],
        minRecommendedPh: 6,
        maxRecommendedPh: 7.5,
        seedingRate: 150,
        notes: 'Тестовая культура-2',
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('Seed ensured: Crop -> Пшеница');

  await Field.findOneAndUpdate(
    { name: 'Поле-1' },
    {
      $set: {
        name: 'Поле-1',
        area: 120,
        soilType: 'chernozem',
        location: 'Северный участок',
        nutrientsLevel: 'medium',
        cadastralNumber: 'RU-01-0001',
        notes: 'Тестовое поле',
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('Seed ensured: Field -> Поле-1');
};