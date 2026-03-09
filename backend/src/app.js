import express from 'express';
import saleRoutes from './routes/saleRoutes.js';
import costRoutes from './routes/costRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import labourCostRoutes from './routes/labourCostRoutes.js';
import planRoutes from './routes/planRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import {
  getDashboard,
  getProduction,
  getFinancial,
  getComparison,
  generateReport,
  forecastYield,
  forecastPrice,
} from './controllers/analyticsController.js';
import exportRoutes from './routes/exportRoutes.js';
import Crop from './models/Crop.js';
import Field from './models/Field.js';

const app = express();

app.use(express.json());

// Подключаем роуты аналитики
app.use('/api/analytics/sales', saleRoutes);
app.use('/api/analytics/costs', costRoutes);
app.use('/api/analytics/procurements', procurementRoutes);
app.use('/api/analytics/labour-costs', labourCostRoutes);
app.use('/api/analytics/plans', planRoutes);
app.use('/api/analytics/export', exportRoutes);
app.get('/api/analytics/dashboard', getDashboard);
app.get('/api/analytics/production', getProduction);
app.get('/api/analytics/financial', getFinancial);
app.get('/api/analytics/comparison', getComparison);
app.post('/api/analytics/report', generateReport);
app.get('/api/analytics/forecast/yield', forecastYield);
app.get('/api/analytics/forecast/price', forecastPrice);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/crops', async (req, res) => {
  try {
    const crops = await Crop.find().select('name _id');
    res.json({ success: true, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/fields', async (req, res) => {
  try {
    const fields = await Field.find().select('name _id');
    res.json({ success: true, data: fields });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(errorHandler);

export default app;