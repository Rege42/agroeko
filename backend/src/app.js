import express from 'express';
import saleRoutes from './routes/saleRoutes.js';
import costRoutes from './routes/costRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import labourCostRoutes from './routes/labourCostRoutes.js';
import planRoutes from './routes/planRoutes.js';

const app = express();

app.use(express.json());

// Подключаем роуты аналитики
app.use('/api/analytics/sales', saleRoutes);
app.use('/api/analytics/costs', costRoutes);
app.use('/api/analytics/procurements', procurementRoutes);
app.use('/api/analytics/labour-costs', labourCostRoutes);
app.use('/api/analytics/plans', planRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default app;