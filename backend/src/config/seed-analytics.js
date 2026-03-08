// backend/src/config/seed-analytics.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  Field,
  Crop,
  CropRotationEntry,
  Sale,
  Cost,
  LabourCost,
  Plan
} from '../models/index.js';

dotenv.config();

const seedAnalytics = async () => {
  try {
    console.log('Начинаем заполнение данными аналитики...');

    // Очищаем коллекции
    await Sale.deleteMany({});
    await Cost.deleteMany({});
    await LabourCost.deleteMany({});
    await Plan.deleteMany({});
    
    console.log('Коллекции аналитики очищены');

    // Получаем существующие поля и культуры
    const fields = await Field.find();
    const crops = await Crop.find();

    if (fields.length === 0 || crops.length === 0) {
      console.log('Ошибка: сначала заполните базовые данные (поля и культуры)');
      return;
    }

    console.log(`Найдено полей: ${fields.length}, культур: ${crops.length}`);

    // Берём первые два поля (если их меньше, дубликаты исключим позже)
    const field1 = fields[0];
    const field2 = fields.length > 1 ? fields[1] : fields[0];
    const crop1 = crops[0];
    const crop2 = crops.length > 1 ? crops[1] : crops[0];

    const currentYear = new Date().getFullYear();

    // ===== ПРОДАЖИ =====
    console.log('Создаём продажи...');
    const sales = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        if (Math.random() > 0.4) {
          const quantity = 5 + Math.random() * 30;
          const pricePerUnit = 12000 + Math.random() * 8000;
          sales.push({
            crop: crop1._id,
            date: new Date(year, month, 5 + Math.floor(Math.random() * 20)),
            quantity: parseFloat(quantity.toFixed(2)),
            unit: 'т',
            pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
            total: parseFloat((quantity * pricePerUnit).toFixed(2)),
            buyer: 'ООО Агротрейд',
            channel: ['опт', 'розница', 'экспорт'][Math.floor(Math.random() * 3)],
          });
        }
      }
    }
    
    if (sales.length > 0) {
      await Sale.insertMany(sales);
      console.log(`Создано ${sales.length} продаж`);
    }

    // ===== ЗАТРАТЫ =====
    console.log('Создаём затраты...');
    const costs = [];
    const categories = [
      'семена', 
      'удобрения', 
      'СЗР', 
      'ГСМ', 
      'запчасти', 
      'услуги сторонних организаций',
      'прочее'
    ];
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const costCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < costCount; i++) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          let item, quantity, pricePerUnit;
          
          switch(category) {
            case 'семена':
              item = 'Семена пшеницы элитные';
              quantity = 100 + Math.random() * 200;
              pricePerUnit = 80 + Math.random() * 40;
              break;
            case 'удобрения':
              item = 'Аммиачная селитра';
              quantity = 200 + Math.random() * 300;
              pricePerUnit = 50 + Math.random() * 30;
              break;
            case 'СЗР':
              item = 'Гербицид сплошного действия';
              quantity = 10 + Math.random() * 30;
              pricePerUnit = 400 + Math.random() * 200;
              break;
            case 'ГСМ':
              item = 'Дизельное топливо';
              quantity = 100 + Math.random() * 500;
              pricePerUnit = 55 + Math.random() * 15;
              break;
            case 'запчасти':
              item = 'Фильтры для трактора';
              quantity = 1 + Math.floor(Math.random() * 5);
              pricePerUnit = 1000 + Math.random() * 2000;
              break;
            case 'услуги сторонних организаций':
              item = 'Услуги по вспашке';
              quantity = 1;
              pricePerUnit = 15000 + Math.random() * 10000;
              break;
            default:
              item = 'Прочие расходы';
              quantity = 1;
              pricePerUnit = 5000 + Math.random() * 5000;
          }
          
          costs.push({
            date: new Date(year, month, 1 + Math.floor(Math.random() * 28)),
            field: Math.random() > 0.5 ? field1._id : field2._id,
            category: category,
            item: item,
            quantity: parseFloat(quantity.toFixed(2)),
            unit: category === 'услуги сторонних организаций' ? 'услуга' : 'кг',
            pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
            totalCost: parseFloat((quantity * pricePerUnit).toFixed(2)),
          });
        }
      }
    }
    
    if (costs.length > 0) {
      await Cost.insertMany(costs);
      console.log(`Создано ${costs.length} записей затрат`);
    }

    // ===== ЗАТРАТЫ НА ПЕРСОНАЛ =====
    console.log('Создаём затраты на персонал...');
    const labourCosts = [];
    const operationTypes = ['посев', 'уход', 'уборка', 'обработка почвы', 'внесение удобрений', 'опрыскивание'];
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const operationsCount = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < operationsCount; i++) {
          const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
          const employeeCount = 2 + Math.floor(Math.random() * 6);
          const hoursWorked = 4 + Math.floor(Math.random() * 5);
          const ratePerHour = 200 + Math.random() * 150;
          
          labourCosts.push({
            date: new Date(year, month, 1 + Math.floor(Math.random() * 28)),
            field: Math.random() > 0.5 ? field1._id : field2._id,
            operationType,
            employeeCount,
            hoursWorked,
            ratePerHour: parseFloat(ratePerHour.toFixed(2)),
            totalCost: parseFloat((employeeCount * hoursWorked * ratePerHour).toFixed(2)),
          });
        }
      }
    }
    
    if (labourCosts.length > 0) {
      await LabourCost.insertMany(labourCosts);
      console.log(`Создано ${labourCosts.length} записей затрат на персонал`);
    }

    // ===== ПЛАНЫ =====
    console.log('Создаём планы...');
    const plans = [
      {
        year: currentYear,
        period: 'год',
        type: 'revenue',
        category: 'общая',
        plannedValue: 5000000,
        unit: 'руб',
      },
      {
        year: currentYear,
        period: 'год',
        type: 'cost',
        category: 'общая',
        plannedValue: 3500000,
        unit: 'руб',
      },
      {
        year: currentYear,
        period: 'год',
        type: 'yield',
        category: crop1.name,
        crop: crop1._id,
        plannedValue: 30,
        unit: 'т/га',
      },
    ];
    
    await Plan.insertMany(plans);
    console.log(`Создано ${plans.length} планов`);

    // ===== ЗАПИСИ СЕВООБОРОТА =====
    console.log('Создаём записи севооборота...');

    // Очищаем существующие записи
    await CropRotationEntry.deleteMany({});
    console.log('Старые записи севооборота удалены');

    const rotationEntries = [];

    // Получаем уникальные поля (на случай, если field1 и field2 совпадают)
    const uniqueFields = [];
    const fieldIds = new Set();
    
    [field1, field2].forEach(field => {
      if (!fieldIds.has(field._id.toString())) {
        fieldIds.add(field._id.toString());
        uniqueFields.push(field);
      }
    });

    // Для каждого уникального поля создаём одну запись на год
    for (const field of uniqueFields) {
      for (let year = currentYear - 2; year <= currentYear; year++) {
        // Чередуем культуры для разнообразия
        const crop = year % 2 === 0 ? crop1 : crop2;
        
        const sowingDate = new Date(year, 3, 10 + Math.floor(Math.random() * 10)); // апрель
        const harvestDate = new Date(year, 7, 15 + Math.floor(Math.random() * 10)); // август
        
        rotationEntries.push({
          field: field._id,
          crop: crop._id,
          seasonYear: year,
          sowingDate: sowingDate,
          harvestDate: year < currentYear ? harvestDate : null,
          predictedYield: parseFloat((24 + Math.random() * 6).toFixed(2)),
          finalYield: year < currentYear ? parseFloat((21 + Math.random() * 9).toFixed(2)) : 0,
          yieldUnit: 'т/га',
          seasonStatus: year < currentYear ? 'harvested' : (year === currentYear ? 'active' : 'planned'),
        });
      }
    }

    if (rotationEntries.length > 0) {
      await CropRotationEntry.insertMany(rotationEntries);
      console.log(`Создано ${rotationEntries.length} записей севооборота`);
    }

    console.log('\nID ДЛЯ ТЕСТИРОВАНИЯ:');
    console.log('==================================================');
    console.log('Культуры:');
    crops.forEach(c => console.log(`  ${c.name}: ${c._id}`));
    console.log('\nПоля:');
    fields.forEach(f => console.log(`  ${f.name}: ${f._id}`));
    console.log('==================================================');
    console.log('База данных успешно заполнена!');

  } catch (error) {
    console.error('Ошибка при заполнении тестовыми данными:', error);
  }
};

export default seedAnalytics;