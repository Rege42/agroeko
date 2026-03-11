import express from "express";
import {
  requestLoggerConsole,
  requestLoggerFile,
} from "./src/middlewares/requestLogger.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import costRoutes from "./src/routes/costRoutes.js";
import procurementRoutes from "./src/routes/procurementRoutes.js";
import labourCostRoutes from "./src/routes/labourCostRoutes.js";
import planRoutes from "./src/routes/planRoutes.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import {
  getDashboard,
  getProduction,
  getFinancial,
  getComparison,
  generateReport,
  forecastYield,
  forecastPrice,
} from "./src/controllers/analyticsController.js";
import exportRoutes from "./src/routes/exportRoutes.js";
import fieldRoutes from "./src/routes/fieldRoutes.js";
import cropRoutes from "./src/routes/cropRoutes.js";
import cropRotationEntryRoutes from "./src/routes/cropRotationEntryRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import soilAnalysisRoutes from "./src/routes/soilAnalysisRoutes.js";
import weatherObservationRoutes from "./src/routes/weatherObservationRoutes.js";
import cropCompatibilityRoutes from "./src/routes/cropCompatibilityRoutes.js";
import agroPlanRoutes from "./src/routes/agroPlanRoutes.js";
import agroPlanStepRoutes from "./src/routes/agroPlanStepRoutes.js";

const app = express();

app.use(express.json());

// Логирование запросов
app.use(requestLoggerConsole);
app.use(requestLoggerFile);

// Подключаем роуты аутентификации
app.use("/api/auth", authRoutes);

// Подключаем роуты аналитики
app.use("/api/analytics/sales", saleRoutes);
app.use("/api/analytics/costs", costRoutes);
app.use("/api/analytics/procurements", procurementRoutes);
app.use("/api/analytics/labour-costs", labourCostRoutes);
app.use("/api/analytics/plans", planRoutes);
app.use("/api/analytics/export", exportRoutes);
app.get("/api/analytics/dashboard", getDashboard);
app.get("/api/analytics/production", getProduction);
app.get("/api/analytics/financial", getFinancial);
app.get("/api/analytics/comparison", getComparison);
app.post("/api/analytics/report", generateReport);
app.get("/api/analytics/forecast/yield", forecastYield);
app.get("/api/analytics/forecast/price", forecastPrice);
app.use("/api/soil-analyses", soilAnalysisRoutes);
app.use("/api/weather-observations", weatherObservationRoutes);

// Подключаем роуты севооборота
app.use("/api/fields", fieldRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/crop-rotation-entries", cropRotationEntryRoutes);
app.use("/api/crop-compatibility", cropCompatibilityRoutes);
app.use("/api/agro-plans", agroPlanRoutes);
app.use("/api/agro-plan-steps", agroPlanStepRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Обработка ошибок
app.use(errorHandler);

export default app;
