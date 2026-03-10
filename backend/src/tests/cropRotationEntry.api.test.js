import request from 'supertest';
import app from '../app.js';
import { Crop, CropRotationEntry, Field } from '../models/index.js';

describe('API /api/crop-rotation-entries', () => {
  describe('POST /api/crop-rotation-entries', () => {
    it('должен успешно создать запись севооборота', async () => {
      const field = await Field.create({
        name: 'Поле-201',
        area: 150,
        soilType: 'chernozem',
        moistureLevel: 'medium',
      });

      const crop = await Crop.create({
        name: 'Ячмень',
        type: 'grain',
        growthPeriodDays: 110,
        suitableSoilTypes: ['chernozem', 'loam'],
      });

      const payload = {
        field: field._id.toString(),
        crop: crop._id.toString(),
        seasonYear: 2026,
        sowingDate: '2026-04-10',
        harvestDate: '2026-08-20',
        predictedYield: 4.2,
        finalYield: 4.0,
        yieldUnit: 't/ha',
        seasonStatus: 'harvested',
        notes: 'Успешный тест создания записи',
      };

      const response = await request(app)
        .post('/api/crop-rotation-entries')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Запись севооборота успешно создана');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.field._id.toString()).toBe(field._id.toString());
      expect(response.body.data.crop._id.toString()).toBe(crop._id.toString());

      const entryInDb = await CropRotationEntry.findOne({
        field: field._id,
        seasonYear: 2026,
      });

      expect(entryInDb).not.toBeNull();
    });

    it('должен вернуть 400, если культура не подходит по типу почвы', async () => {
      const field = await Field.create({
        name: 'Поле-202',
        area: 100,
        soilType: 'sandy',
        moistureLevel: 'medium',
      });

      const crop = await Crop.create({
        name: 'Соя',
        type: 'legume',
        growthPeriodDays: 115,
        suitableSoilTypes: ['chernozem'],
      });

      const payload = {
        field: field._id.toString(),
        crop: crop._id.toString(),
        seasonYear: 2026,
      };

      const response = await request(app)
        .post('/api/crop-rotation-entries')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.some((e) => e.field === 'crop')).toBe(true);
    });

    it('должен вернуть 409 при дублировании записи сезона для одного поля', async () => {
      const field = await Field.create({
        name: 'Поле-203',
        area: 80,
        soilType: 'chernozem',
        moistureLevel: 'medium',
      });

      const crop1 = await Crop.create({
        name: 'Рожь',
        type: 'grain',
        growthPeriodDays: 120,
        suitableSoilTypes: ['chernozem'],
      });

      const crop2 = await Crop.create({
        name: 'Овес',
        type: 'grain',
        growthPeriodDays: 100,
        suitableSoilTypes: ['chernozem'],
      });

      await CropRotationEntry.create({
        field: field._id,
        crop: crop1._id,
        seasonYear: 2026,
        seasonStatus: 'planned',
      });

      const response = await request(app)
        .post('/api/crop-rotation-entries')
        .send({
          field: field._id.toString(),
          crop: crop2._id.toString(),
          seasonYear: 2026,
          seasonStatus: 'planned',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Запись севооборота для данного поля и сезона уже существует');
    });
  });
});