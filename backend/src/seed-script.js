// backend/src/seed-all.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedData } from './config/seed.js';
import seedAnalytics from './config/seed-analytics.js';

dotenv.config();

const seedAll = async () => {
  try {
    console.log('Начинаем заполнение базы данных...');
    console.log('==================================================');
    
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Подключено к MongoDB');
    
    // Шаг 1: Заполняем базовые данные (поля и культуры)
    console.log('\nШаг 1: Базовые данные');
    await seedData();
    
    // Шаг 2: Заполняем данные аналитики
    console.log('\nШаг 2: Данные аналитики');
    await seedAnalytics();
    
    console.log('\n==================================================');
    console.log('База данных успешно заполнена!');
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
};

seedAll();