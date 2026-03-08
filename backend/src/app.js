import express from 'express';
import saleRoutes from './routes/saleRoutes.js';
import costRoutes from './routes/costRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import labourCostRoutes from './routes/labourCostRoutes.js';
import planRoutes from './routes/planRoutes.js';
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

export default app;