// backend/src/seed-all.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { seedData } from "./seed.js";
import seedAnalytics from "./seed-analytics.js";
import { seedUsers } from "./seedUsers.js";
import { seedCropCompability } from "./seedCropCompatibility.js";

dotenv.config();

const seedAll = async () => {
  try {
    console.log("Начинаем заполнение базы данных...");
    console.log("==================================================");

    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Подключено к MongoDB");

    // Шаг 1: Заполняем базовые данные (пользователи)
    console.log("\nШаг 1: Базовые данные");
    await seedUsers();

    // Шаг 2: Заполняем данные полей и культур (поля и культуры)
    console.log("\nШаг 2: данные полей и культур ");
    await seedData();
    await seedCropCompability();

    // Шаг 3: Заполняем данные аналитики
    console.log("\nШаг 3: Данные аналитики");
    await seedAnalytics();

    console.log("\n==================================================");
    console.log("База данных успешно заполнена!");
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Отключено от MongoDB");
  }
};

seedAll();
