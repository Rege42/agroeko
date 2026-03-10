import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { Crop } from "../models/index.js";

describe("API /api/crops", () => {
  describe("POST /api/crops", () => {
    it("должен успешно создать культуру", async () => {
      const payload = {
        name: "Пшеница озимая",
        type: "grain",
        growthPeriodDays: 240,
        averageYield: 5.6,
        yieldUnit: "t/ha",
        suitableSoilTypes: ["chernozem", "loam"],
        minRecommendedPh: 6.0,
        maxRecommendedPh: 7.5,
        notes: "Тестовая культура",
      };
      const response = await request(app).post("/api/crops").send(payload);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Культура успешно создана");
      expect(response.body.data.name).toBe(payload.name);

      const cropInDb = await Crop.findOne({ name: payload.name });
      expect(cropInDb).not.toBeNull();
    });

    it("должен вернуть 400 при minRecommendedPh больше maxRecommendedPh", async () => {
      const payload = {
        name: "Кукуруза",
        type: "grain",
        growthPeriodDays: 130,
        minRecommendedPh: 8,
        maxRecommendedPh: 6,
      };
      const response = await request(app).post("/api/crops").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("должен быстро ответить health-check", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
    }, 30000);
  });
});
