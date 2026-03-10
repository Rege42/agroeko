import request from 'supertest';
import app from '../app.js';
import { Field } from '../models/index.js';

describe('API /api/fields', () => {
  describe('POST /api/fields', () => {
    it('должен успешно создать поле', async () => {
      const payload = {
        name: 'Поле-101',
        area: 125.5,
        soilType: 'chernozem',
        location: 'Северный участок',
        moistureLevel: 'medium',
        cadastralNumber: 'RU-TEST-101',
        notes: 'Тестовое поле',
      };

      const response = await request(app)
        .post('/api/fields')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Поле успешно создано');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(payload.name);

      const fieldInDb = await Field.findOne({ name: payload.name });
      expect(fieldInDb).not.toBeNull();
    });

    it('должен вернуть 400 при попытке создать поле с отрицательной площадью', async () => {
      const payload = {
        name: 'Поле-102',
        area: -10,
        soilType: 'chernozem',
      };

      const response = await request(app)
        .post('/api/fields')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.some((e) => e.field === 'area')).toBe(true);
    });
  });

  describe('GET /api/fields', () => {
    it('должен вернуть список полей с фильтрацией и пагинацией', async () => {
      await Field.create([
        {
          name: 'Поле-A',
          area: 100,
          soilType: 'chernozem',
          moistureLevel: 'medium',
          isActive: true,
        },
        {
          name: 'Поле-B',
          area: 120,
          soilType: 'chernozem',
          moistureLevel: 'high',
          isActive: true,
        },
        {
          name: 'Поле-C',
          area: 90,
          soilType: 'sandy',
          moistureLevel: 'low',
          isActive: false,
        },
      ]);

      const response = await request(app)
        .get('/api/fields')
        .query({
          soilType: 'chernozem',
          isActive: true,
          page: 1,
          limit: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
      expect(response.body.items[0].soilType).toBe('chernozem');
      expect(response.body.items[0].isActive).toBe(true);
    });
  });
});