import { Crop, Field, CropRotationGroup } from "../models/index.js";

export const seedData = async () => {

  await CropRotationGroup.deleteMany({});
  await Crop.deleteMany({});
  await Field.deleteMany({});

  /*
  ==========================
  ГРУППЫ СЕВООБОРОТА
  ==========================
  */

  const groups = await CropRotationGroup.insertMany([
    {
      code: "CEREALS",
      name: "Зерновые",
      displayOrderRow: 1,
      displayOrderColumn: 1,
      isActive: true,
    },
    {
      code: "LEGUMES",
      name: "Бобовые",
      displayOrderRow: 2,
      displayOrderColumn: 2,
      isActive: true,
    },
    {
      code: "TECHNICAL",
      name: "Технические",
      displayOrderRow: 3,
      displayOrderColumn: 3,
      isActive: true,
    },
    {
      code: "OILSEEDS",
      name: "Масличные",
      displayOrderRow: 4,
      displayOrderColumn: 4,
      isActive: true,
    },
  ]);

  const groupMap = {};
  groups.forEach(g => groupMap[g.code] = g._id);

  console.log("Seed: CropRotationGroups");

  /*
  ==========================
  КУЛЬТУРЫ
  ==========================
  */

  await Crop.insertMany([
    {
      name: "Пшеница",
      type: "grain",
      growthPeriodDays: 120,
      averageYield: 4.5,
      yieldUnit: "t/ha",
      cropRotationGroup: groupMap.CEREALS,
      suitableSoilTypes: ["chernozem", "loam"],
      minRecommendedPh: 6,
      maxRecommendedPh: 7.5,
      seedingRate: 200,
    },
    {
      name: "Ячмень",
      type: "grain",
      growthPeriodDays: 100,
      averageYield: 4,
      yieldUnit: "t/ha",
      cropRotationGroup: groupMap.CEREALS,
      suitableSoilTypes: ["chernozem", "loam"],
      minRecommendedPh: 6,
      maxRecommendedPh: 7.5,
      seedingRate: 180,
    },
    {
      name: "Горох",
      type: "legume",
      growthPeriodDays: 90,
      averageYield: 3,
      yieldUnit: "t/ha",
      cropRotationGroup: groupMap.LEGUMES,
      suitableSoilTypes: ["chernozem"],
      minRecommendedPh: 6,
      maxRecommendedPh: 7,
      seedingRate: 120,
    },
    {
      name: "Подсолнечник",
      type: "technical",
      growthPeriodDays: 110,
      averageYield: 2.5,
      yieldUnit: "t/ha",
      cropRotationGroup: groupMap.TECHNICAL,
      suitableSoilTypes: ["chernozem", "loam"],
      minRecommendedPh: 6,
      maxRecommendedPh: 7.5,
      seedingRate: 70,
    },
  ]);

  console.log("Seed: Crops");

  /*
  ==========================
  ПОЛЯ
  ==========================
  */

  await Field.insertMany([
    {
      name: "Поле-1",
      area: 120,
      soilType: "chernozem",
      location: "Северный участок",
      nutrientsLevel: "medium",
      cadastralNumber: "RU-01-0001",
    },
    {
      name: "Поле-2",
      area: 95,
      soilType: "loam",
      location: "Южный участок",
      nutrientsLevel: "high",
      cadastralNumber: "RU-01-0002",
    },
  ]);

  console.log("Seed: Fields");
};