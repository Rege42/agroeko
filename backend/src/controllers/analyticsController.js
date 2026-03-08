// backend/src/controllers/analyticsController.js
import Field from '../models/Field.js';
import CropRotationEntry from '../models/CropRotationEntry.js';
import Sale from '../models/Sale.js';
import Cost from '../models/Cost.js';
import LabourCost from '../models/LabourCost.js';
import Plan from '../models/Plan.js';

/**
 * GET /api/analytics/dashboard
 * Ключевые показатели за период
 */
export const getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // По умолчанию – текущий год
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    // Общая площадь и количество полей
    const fields = await Field.find({}, 'area');
    const totalArea = fields.reduce((acc, f) => acc + f.area, 0);
    const fieldsCount = fields.length;

    // Статус кампаний (посевная/уборочная) – записи за период
    const campaigns = await CropRotationEntry.find({
      $or: [
        { sowingDate: { $gte: start, $lte: end } },
        { harvestDate: { $gte: start, $lte: end } }
      ]
    }, 'sowingDate harvestDate seasonStatus');
    const sowingCount = campaigns.filter(c => c.sowingDate && c.sowingDate >= start && c.sowingDate <= end).length;
    const harvestCount = campaigns.filter(c => c.harvestDate && c.harvestDate >= start && c.harvestDate <= end).length;

    // Средняя урожайность по завершённым уборкам
    const yieldAgg = await CropRotationEntry.aggregate([
      { $match: { harvestDate: { $gte: start, $lte: end }, finalYield: { $gt: 0 } } },
      { $group: { _id: null, avgYield: { $avg: '$finalYield' } } }
    ]);
    const avgYield = yieldAgg[0]?.avgYield || 0;

    // Выручка
    const revenueAgg = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Затраты (из Cost и LabourCost)
    const costAgg = await Cost.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalCost: { $sum: '$totalCost' } } }
    ]);
    const labourCostAgg = await LabourCost.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalLabourCost: { $sum: '$totalCost' } } }
    ]);
    const totalCost = (costAgg[0]?.totalCost || 0) + (labourCostAgg[0]?.totalLabourCost || 0);

    const profit = totalRevenue - totalCost;
    const profitability = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalArea,
        fieldsCount,
        campaigns: {
          sowing: sowingCount,
          harvest: harvestCount,
        },
        avgYield,
        totalRevenue,
        totalCost,
        profit,
        profitability: profitability.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/production
 * Производственные показатели с группировкой (по культурам, полям, годам)
 * Параметры:
 * - startDate, endDate (фильтр по дате уборки)
 * - groupBy: culture | field | year
 * - cultures (csv id культур)
 * - fields (csv id полей)
 */
export const getProduction = async (req, res) => {
  try {
    const { startDate, endDate, groupBy, cultures, fields } = req.query;

    // Валидация groupBy
    if (!['culture', 'field', 'year'].includes(groupBy)) {
      return res.status(400).json({ success: false, error: 'groupBy must be one of: culture, field, year' });
    }

    // Формируем фильтр
    const match = {};
    if (startDate || endDate) {
      match.harvestDate = {};
      if (startDate) match.harvestDate.$gte = new Date(startDate);
      if (endDate) match.harvestDate.$lte = new Date(endDate);
    }
    if (cultures) {
      const cultureIds = cultures.split(',').map(id => id.trim());
      match.crop = { $in: cultureIds };
    }
    if (fields) {
      const fieldIds = fields.split(',').map(id => id.trim());
      match.field = { $in: fieldIds };
    }

    // Определяем поле группировки
    let groupById;
    if (groupBy === 'year') {
      groupById = '$seasonYear';
    } else if (groupBy === 'culture') {
      groupById = '$crop';
    } else { // field
      groupById = '$field';
    }

    // Агрегация
    const pipeline = [
      { $match: match },
      // Добавляем информацию о поле (нужна для площади)
      { $lookup: {
          from: 'fields',
          localField: 'field',
          foreignField: '_id',
          as: 'fieldInfo'
        }
      },
      { $unwind: '$fieldInfo' },
      // Группировка
      { $group: {
          _id: groupById,
          totalYield: { $sum: '$finalYield' },
          avgYield: { $avg: '$finalYield' },
          count: { $sum: 1 },
          totalArea: { $sum: '$fieldInfo.area' }, // сумма площадей полей в группе
        }
      }
    ];

    // Для culture и field добавляем lookup, чтобы получить название
    if (groupBy === 'culture' || groupBy === 'field') {
      pipeline.push(
        { $lookup: {
            from: groupBy === 'culture' ? 'crops' : 'fields',
            localField: '_id',
            foreignField: '_id',
            as: 'details'
          }
        },
        { $unwind: '$details' },
        { $project: {
            name: '$details.name',
            totalYield: 1,
            avgYield: 1,
            count: 1,
            totalArea: 1,
          }
        }
      );
    } else {
      // Для года просто переименовываем _id
      pipeline.push({
        $project: {
          year: '$_id',
          totalYield: 1,
          avgYield: 1,
          count: 1,
          totalArea: 1,
        }
      });
    }

    const data = await CropRotationEntry.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/financial
 * Финансовые показатели с группировкой
 * Параметры:
 * - startDate, endDate
 * - groupBy: category (статья затрат), culture, field, month, quarter, year
 * - type: revenue | cost | both (по умолчанию both)
 */
export const getFinancial = async (req, res) => {
  try {
    const { startDate, endDate, groupBy, type = 'both' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const match = { date: { $gte: start, $lte: end } };

    let result = {};

    // Выручка (если нужно)
    if (type === 'both' || type === 'revenue') {
      const revenuePipeline = [
        { $match: match },
        { $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ];
      const revenueData = await Sale.aggregate(revenuePipeline);
      result.revenue = revenueData[0] || { totalRevenue: 0, count: 0 };
    }

    // Затраты (Cost + LabourCost)
    if (type === 'both' || type === 'cost') {
      const costPipeline = [
        { $match: match },
        { $group: {
            _id: null,
            totalCost: { $sum: '$totalCost' },
            count: { $sum: 1 }
          }
        }
      ];
      const costData = await Cost.aggregate(costPipeline);
      const labourData = await LabourCost.aggregate(costPipeline);
      const totalCost = (costData[0]?.totalCost || 0) + (labourData[0]?.totalCost || 0);
      result.cost = {
        totalCost,
        count: (costData[0]?.count || 0) + (labourData[0]?.count || 0)
      };
    }

    // Если нужна группировка по категориям, культурам и т.д. – можно расширить
    // Для простоты пока возвращаем общие суммы

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/comparison
 * Сравнение двух периодов или факта с планом
 * Параметры:
 * - period1Start, period1End
 * - period2Start, period2End
 * - compareWith: previous (по умолчанию) или plan
 * - planYear (если compareWith=plan)
 */
export const getComparison = async (req, res) => {
  try {
    const { period1Start, period1End, period2Start, period2End, compareWith = 'previous', planYear } = req.query;

    if (!period1Start || !period1End) {
      return res.status(400).json({ success: false, error: 'period1Start and period1End are required' });
    }

    const p1Start = new Date(period1Start);
    const p1End = new Date(period1End);
    let p2Start, p2End;

    if (compareWith === 'previous') {
      if (!period2Start || !period2End) {
        // если не указаны, берём такой же длины период, смещённый на год назад
        const duration = p1End - p1Start;
        p2Start = new Date(p1Start.getFullYear() - 1, p1Start.getMonth(), p1Start.getDate());
        p2End = new Date(p2Start.getTime() + duration);
      } else {
        p2Start = new Date(period2Start);
        p2End = new Date(period2End);
      }
    } else if (compareWith === 'plan') {
      if (!planYear) {
        return res.status(400).json({ success: false, error: 'planYear is required when compareWith=plan' });
      }
      // плановые показатели за год
    } else {
      return res.status(400).json({ success: false, error: 'compareWith must be previous or plan' });
    }

    // Функция для получения сводки за период
    const getSummary = async (start, end) => {
      const match = { date: { $gte: start, $lte: end } };
      const revenue = await Sale.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const cost = await Cost.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);
      const labour = await LabourCost.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);
      const totalRevenue = revenue[0]?.total || 0;
      const totalCost = (cost[0]?.total || 0) + (labour[0]?.total || 0);
      return { totalRevenue, totalCost, profit: totalRevenue - totalCost };
    };

    const summary1 = await getSummary(p1Start, p1End);
    let summary2 = { totalRevenue: 0, totalCost: 0, profit: 0 };

    if (compareWith === 'previous') {
      summary2 = await getSummary(p2Start, p2End);
    } else if (compareWith === 'plan') {
      // Получаем плановые значения из модели Plan
      const plans = await Plan.find({ year: parseInt(planYear) });
      summary2.totalRevenue = plans.filter(p => p.type === 'revenue').reduce((acc, p) => acc + p.plannedValue, 0);
      summary2.totalCost = plans.filter(p => p.type === 'cost').reduce((acc, p) => acc + p.plannedValue, 0);
      summary2.profit = summary2.totalRevenue - summary2.totalCost;
    }

    const diff = {
      revenueDiff: summary2.totalRevenue - summary1.totalRevenue,
      revenuePercent: summary1.totalRevenue ? ((summary2.totalRevenue - summary1.totalRevenue) / summary1.totalRevenue * 100).toFixed(2) : 0,
      costDiff: summary2.totalCost - summary1.totalCost,
      costPercent: summary1.totalCost ? ((summary2.totalCost - summary1.totalCost) / summary1.totalCost * 100).toFixed(2) : 0,
      profitDiff: summary2.profit - summary1.profit,
      profitPercent: summary1.profit ? ((summary2.profit - summary1.profit) / summary1.profit * 100).toFixed(2) : 0,
    };

    res.json({
      success: true,
      data: {
        period1: { start: p1Start, end: p1End, ...summary1 },
        period2: compareWith === 'previous' ? { start: p2Start, end: p2End, ...summary2 } : { planYear, ...summary2 },
        diff,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analytics/report
 * Генерация данных для отчёта по параметрам формы
 * Ожидает body с полями:
 * - periodType (day/week/month/quarter/year/custom)
 * - startDate, endDate
 * - fields (массив id полей)
 * - cultures (массив id культур)
 * - reportType (standard/detailed/technical)
 * - format (web/pdf/excel) – пока игнорируем, всегда JSON
 */
export const generateReport = async (req, res) => {
  try {
    const { periodType, startDate, endDate, fields, cultures, reportType } = req.body;

    // Определяем период
    let start, end;
    if (periodType === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Для других типов можно реализовать логику, пока заглушка
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Строим фильтры
    const fieldFilter = fields && fields.length ? { field: { $in: fields } } : {};
    const cultureFilter = cultures && cultures.length ? { crop: { $in: cultures } } : {};

    // Собираем данные в зависимости от reportType
    let data = {};

    // Производственные показатели (урожайность по полям/культурам)
    const production = await CropRotationEntry.aggregate([
      { $match: {
          harvestDate: { $gte: start, $lte: end },
          ...fieldFilter,
          ...cultureFilter,
        }
      },
      { $lookup: { from: 'fields', localField: 'field', foreignField: '_id', as: 'fieldInfo' } },
      { $unwind: '$fieldInfo' },
      { $lookup: { from: 'crops', localField: 'crop', foreignField: '_id', as: 'cropInfo' } },
      { $unwind: '$cropInfo' },
      { $project: {
          fieldName: '$fieldInfo.name',
          cropName: '$cropInfo.name',
          seasonYear: 1,
          sowingDate: 1,
          harvestDate: 1,
          finalYield: 1,
          predictedYield: 1,
          area: '$fieldInfo.area',
        }
      },
      { $sort: { fieldName: 1, cropName: 1 } }
    ]);

    // Финансовые показатели
    const financial = {};

    if (reportType !== 'technical') {
      // Выручка
      const revenue = await Sale.aggregate([
        { $match: { date: { $gte: start, $lte: end }, ...cultureFilter } },
        { $lookup: { from: 'crops', localField: 'crop', foreignField: '_id', as: 'cropInfo' } },
        { $unwind: '$cropInfo' },
        { $project: {
            date: 1,
            cropName: '$cropInfo.name',
            quantity: 1,
            unit: 1,
            pricePerUnit: 1,
            total: 1,
            buyer: 1,
            channel: 1,
          }
        },
        { $sort: { date: -1 } }
      ]);

      // Затраты
      const costs = await Cost.aggregate([
        { $match: { date: { $gte: start, $lte: end }, ...fieldFilter, ...cultureFilter } },
        { $lookup: { from: 'fields', localField: 'field', foreignField: '_id', as: 'fieldInfo' } },
        { $unwind: { path: '$fieldInfo', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'crops', localField: 'crop', foreignField: '_id', as: 'cropInfo' } },
        { $unwind: { path: '$cropInfo', preserveNullAndEmptyArrays: true } },
        { $project: {
            date: 1,
            category: 1,
            item: 1,
            quantity: 1,
            unit: 1,
            pricePerUnit: 1,
            totalCost: 1,
            fieldName: '$fieldInfo.name',
            cropName: '$cropInfo.name',
          }
        },
        { $sort: { date: -1 } }
      ]);

      financial.revenue = revenue;
      financial.costs = costs;
    }

    data.production = production;
    data.financial = financial;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== ПРОГНОЗИРОВАНИЕ ====================

/**
 * GET /api/analytics/forecast/yield
 * Прогноз урожайности на основе исторических данных
 * Параметры:
 * - cropId (ID культуры, обязательный)
 * - fieldId (ID поля, опционально)
 * - years (количество лет для обучения, по умолчанию 5)
 * - method (simple_avg, moving_avg, linear_trend) - по умолчанию simple_avg
 */
export const forecastYield = async (req, res) => {
  try {
    const { cropId, fieldId, years = 5, method = 'simple_avg' } = req.query;

    if (!cropId) {
      return res.status(400).json({ success: false, error: 'cropId is required' });
    }

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;

    // Фильтр для исторических данных
    const match = {
      crop: cropId,
      seasonYear: { $gte: startYear, $lt: currentYear },
      finalYield: { $gt: 0 }
    };
    if (fieldId) match.field = fieldId;

    // Получаем среднюю урожайность по годам
    const history = await CropRotationEntry.aggregate([
      { $match: match },
      { $sort: { seasonYear: 1 } },
      { $group: {
          _id: '$seasonYear',
          avgYield: { $avg: '$finalYield' }
        }
      },
      { $project: { year: '$_id', yield: '$avgYield' } }
    ]);

    if (history.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Недостаточно исторических данных для прогноза (нужно минимум 2 года)'
      });
    }

    // Вычисляем прогноз
    const yearsList = history.map(h => h.year);
    const yieldsList = history.map(h => h.yield);
    let forecastValue;

    if (method === 'simple_avg') {
      forecastValue = yieldsList.reduce((a, b) => a + b, 0) / yieldsList.length;
    } else if (method === 'moving_avg') {
      const recent = yieldsList.slice(-3);
      forecastValue = recent.reduce((a, b) => a + b, 0) / recent.length;
    } else if (method === 'linear_trend') {
      // Линейная регрессия: y = a + b*x
      const n = history.length;
      const sumX = yearsList.reduce((a, b) => a + b, 0);
      const sumY = yieldsList.reduce((a, b) => a + b, 0);
      const sumXY = yearsList.reduce((acc, year, i) => acc + year * yieldsList[i], 0);
      const sumX2 = yearsList.reduce((acc, year) => acc + year * year, 0);
      const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const a = (sumY - b * sumX) / n;
      forecastValue = a + b * currentYear;
    } else {
      forecastValue = yieldsList[yieldsList.length - 1]; // последний известный
    }

    // Доверительный интервал (стандартное отклонение)
    const mean = yieldsList.reduce((a, b) => a + b, 0) / yieldsList.length;
    const sqDiff = yieldsList.map(y => Math.pow(y - mean, 2));
    const variance = sqDiff.reduce((a, b) => a + b, 0) / (yieldsList.length - 1);
    const stdDev = Math.sqrt(variance);
    const optimistic = forecastValue + stdDev;
    const pessimistic = Math.max(forecastValue - stdDev, 0);

    // Получаем названия
    const crop = await Crop.findById(cropId);
    const field = fieldId ? await Field.findById(fieldId) : null;

    // Формируем ответ
    const result = {
      crop: crop?.name || 'Неизвестная культура',
      field: field?.name || 'Все поля',
      period: `Прогноз на ${currentYear} год`,
      generatedAt: new Date().toISOString(),
      model: method === 'linear_trend' ? 'Линейный тренд' :
             method === 'moving_avg' ? 'Скользящее среднее (3 года)' :
             'Среднее арифметическое',
      area: field?.area || null,
      scenarios: {
        average: {
          value: forecastValue.toFixed(2),
          unit: 'т/га',
          change: `${((forecastValue / mean - 1) * 100).toFixed(1)}% к среднему`
        },
        optimistic: {
          value: optimistic.toFixed(2),
          unit: 'т/га',
          change: '+'
        },
        pessimistic: {
          value: pessimistic.toFixed(2),
          unit: 'т/га',
          change: '-'
        },
      },
      historical: history.map(h => ({ year: h.year, yield: h.yield })),
      factors: [
        { name: 'Историческая тенденция', impact: 'neutral', description: `На основе данных за ${history.length} лет` },
      ],
      recommendations: [
        'Прогноз основан на исторических данных, рекомендуется учитывать погодные условия текущего сезона',
      ],
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/forecast/price
 * Прогноз цен на продукцию
 * Параметры:
 * - cropId (ID культуры)
 * - months (количество месяцев для прогноза, по умолчанию 3)
 */
export const forecastPrice = async (req, res) => {
  try {
    const { cropId, months = 3 } = req.query;

    if (!cropId) {
      return res.status(400).json({ success: false, error: 'cropId is required' });
    }

    // Получаем последние продажи по культуре
    const sales = await Sale.find({ crop: cropId })
      .sort({ date: -1 })
      .limit(20)
      .populate('crop', 'name');

    if (sales.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Недостаточно данных о продажах для прогноза'
      });
    }

    // Простая модель: средняя цена за последние N продаж + взвешенное последнее значение
    const prices = sales.map(s => s.pricePerUnit);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const lastPrice = prices[0];

    // Прогноз на ближайшие месяцы (экспоненциальное сглаживание с α=0.3)
    const forecast = [];
    let prev = lastPrice;
    for (let i = 1; i <= months; i++) {
      const next = 0.3 * avgPrice + 0.7 * prev; // простой фильтр
      forecast.push({
        month: new Date(new Date().getFullYear(), new Date().getMonth() + i, 1)
          .toLocaleString('ru', { month: 'long', year: 'numeric' }),
        price: next.toFixed(2),
        unit: sales[0].unit || 'руб/т',
      });
      prev = next;
    }

    res.json({
      success: true,
      data: {
        crop: sales[0]?.crop?.name || 'Неизвестная культура',
        currentPrice: lastPrice,
        averagePrice: avgPrice,
        forecast,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};