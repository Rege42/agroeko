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
    console.log('Начинаем расширенное заполнение данными аналитики...');

    // Очищаем коллекции аналитики
    await Sale.deleteMany({});
    await Cost.deleteMany({});
    await LabourCost.deleteMany({});
    await Plan.deleteMany({});
    await CropRotationEntry.deleteMany({});
    console.log('Коллекции аналитики очищены');

    // Получаем все существующие поля и культуры
    const fields = await Field.find();
    const crops = await Crop.find();

    if (fields.length === 0 || crops.length === 0) {
      console.log('Ошибка: сначала заполните базовые данные (поля и культуры)');
      return;
    }

    console.log(`Найдено полей: ${fields.length}, культур: ${crops.length}`);

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5; // данные за последние 5 лет

    // ===== ПРОДАЖИ =====
    console.log('Создаём продажи...');
    const sales = [];
    const buyers = ['ООО Агротрейд', 'ЗАО Зернопром', 'ИП Иванов', 'ЭкспортХлеб', 'Агро-Юг', 'Фермерское хозяйство "Рассвет"'];
    const channels = ['опт', 'розница', 'экспорт'];

    for (let year = startYear; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        // 80% вероятность продажи в месяце
        if (Math.random() < 0.8) {
          const crop = crops[Math.floor(Math.random() * crops.length)];
          const quantity = 5 + Math.random() * 50;
          let pricePerUnit;
          // Разные цены для разных культур
          switch (crop.type) {
            case 'grain': pricePerUnit = 12000 + Math.random() * 6000; break;
            case 'oilseed': pricePerUnit = 25000 + Math.random() * 8000; break;
            default: pricePerUnit = 10000 + Math.random() * 10000;
          }
          sales.push({
            crop: crop._id,
            date: new Date(year, month, 5 + Math.floor(Math.random() * 20)),
            quantity: parseFloat(quantity.toFixed(2)),
            unit: 'т',
            pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
            total: parseFloat((quantity * pricePerUnit).toFixed(2)),
            buyer: buyers[Math.floor(Math.random() * buyers.length)],
            channel: channels[Math.floor(Math.random() * channels.length)],
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
      'семена', 'удобрения', 'СЗР', 'ГСМ', 'запчасти',
      'услуги сторонних организаций', 'амортизация', 'прочее'
    ];
    const suppliers = ['АгроСнаб', 'Технопарк', 'ХимПром', 'ООО "Ресурс"', 'ИП Сидоров'];

    for (let year = startYear; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        // 2-5 затрат в месяц
        const costCount = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < costCount; i++) {
          const field = fields[Math.floor(Math.random() * fields.length)];
          const category = categories[Math.floor(Math.random() * categories.length)];
          let item, quantity, pricePerUnit;

          switch(category) {
            case 'семена':
              item = 'Семена элитные';
              quantity = 50 + Math.random() * 300;
              pricePerUnit = 60 + Math.random() * 40;
              break;
            case 'удобрения':
              item = 'Аммиачная селитра';
              quantity = 100 + Math.random() * 500;
              pricePerUnit = 40 + Math.random() * 30;
              break;
            case 'СЗР':
              item = 'Гербицид';
              quantity = 5 + Math.random() * 50;
              pricePerUnit = 300 + Math.random() * 400;
              break;
            case 'ГСМ':
              item = 'Дизельное топливо';
              quantity = 100 + Math.random() * 1000;
              pricePerUnit = 50 + Math.random() * 20;
              break;
            case 'запчасти':
              item = 'Фильтры, ремни';
              quantity = 1 + Math.floor(Math.random() * 10);
              pricePerUnit = 500 + Math.random() * 1500;
              break;
            case 'услуги сторонних организаций':
              item = 'Услуги по вспашке/уборке';
              quantity = 1;
              pricePerUnit = 10000 + Math.random() * 30000;
              break;
            case 'амортизация':
              item = 'Амортизация техники';
              quantity = 1;
              pricePerUnit = 20000 + Math.random() * 50000;
              break;
            default:
              item = 'Прочие расходы';
              quantity = 1;
              pricePerUnit = 5000 + Math.random() * 15000;
          }

          costs.push({
            date: new Date(year, month, 1 + Math.floor(Math.random() * 28)),
            field: field._id,
            category,
            item,
            quantity: parseFloat(quantity.toFixed(2)),
            unit: (category === 'услуги сторонних организаций' || category === 'амортизация') ? 'услуга' : 'кг',
            pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
            totalCost: parseFloat((quantity * pricePerUnit).toFixed(2)),
            supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
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
    const operationTypes = ['посев', 'уход', 'уборка', 'обработка почвы', 'внесение удобрений', 'опрыскивание', 'прочее'];

    for (let year = startYear; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        // 1-4 операции в месяц
        const operationsCount = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < operationsCount; i++) {
          const field = fields[Math.floor(Math.random() * fields.length)];
          const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
          const employeeCount = 1 + Math.floor(Math.random() * 10);
          const hoursWorked = 4 + Math.floor(Math.random() * 8);
          const ratePerHour = 150 + Math.random() * 150;

          labourCosts.push({
            date: new Date(year, month, 1 + Math.floor(Math.random() * 28)),
            field: field._id,
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
    const plans = [];
    // Общие планы на каждый год
    for (let year = startYear; year <= currentYear; year++) {
      plans.push(
        {
          year,
          period: 'год',
          type: 'revenue',
          category: 'общая',
          plannedValue: 3000000 + Math.random() * 4000000,
          unit: 'руб',
        },
        {
          year,
          period: 'год',
          type: 'cost',
          category: 'общая',
          plannedValue: 2000000 + Math.random() * 3000000,
          unit: 'руб',
        }
      );
      // Планы по каждой культуре
      crops.forEach(crop => {
        plans.push({
          year,
          period: 'год',
          type: 'yield',
          category: crop.name,
          crop: crop._id,
          plannedValue: (crop.averageYield || 20) + Math.random() * 10,
          unit: 'т/га',
        });
      });
    }

    await Plan.insertMany(plans);
    console.log(`Создано ${plans.length} планов`);

    // ===== ЗАПИСИ СЕВООБОРОТА (урожайность) =====
    console.log('Создаём записи севооборота...');

    const rotationEntries = [];

    for (const field of fields) {
      for (let year = startYear; year <= currentYear; year++) {
        // Случайная культура из списка
        const crop = crops[Math.floor(Math.random() * crops.length)];
        const sowingDate = new Date(year, 2 + Math.floor(Math.random() * 2), 10 + Math.floor(Math.random() * 20)); // март-апрель
        const harvestDate = new Date(year, 7 + Math.floor(Math.random() * 2), 15 + Math.floor(Math.random() * 20)); // август-сентябрь

        // Базовая урожайность зависит от культуры
        let baseYield = crop.averageYield || 25;
        // Случайное отклонение
        const finalYield = baseYield * (0.7 + Math.random() * 0.8);
        const predictedYield = baseYield * (0.8 + Math.random() * 0.5);

        rotationEntries.push({
          field: field._id,
          crop: crop._id,
          seasonYear: year,
          sowingDate,
          harvestDate: year < currentYear ? harvestDate : null, // для текущего года может быть не убрано
          predictedYield: parseFloat(predictedYield.toFixed(2)),
          finalYield: year < currentYear ? parseFloat(finalYield.toFixed(2)) : 0,
          yieldUnit: 'т/га',
          seasonStatus: year < currentYear ? 'harvested' : (year === currentYear ? 'active' : 'planned'),
        });
      }
    }

    if (rotationEntries.length > 0) {
      await CropRotationEntry.insertMany(rotationEntries);
      console.log(`Создано ${rotationEntries.length} записей севооборота`);
    }

    console.log('\nБаза данных успешно заполнена расширенными данными!');
    console.log('\nСтатистика:');
    console.log(`   Продаж: ${sales.length}`);
    console.log(`   Затрат: ${costs.length}`);
    console.log(`   Затрат на персонал: ${labourCosts.length}`);
    console.log(`   Записей севооборота: ${rotationEntries.length}`);
    console.log(`   Планов: ${plans.length}`);

  } catch (error) {
    console.error('Ошибка при заполнении тестовыми данными:', error);
  }
};

export default seedAnalytics;