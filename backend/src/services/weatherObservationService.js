import { WeatherObservation, Field } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { buildPagination } from '../utils/buildPagination.js';

class WeatherObservationService {
  async createObservation(data) {
    const field = await Field.findById(data.field);
    if (!field) {
      throw new AppError('Поле не найдено', 404, [
        { field: 'field', message: 'Поле с указанным идентификатором не существует' },
      ]);
    }
    const observation = await WeatherObservation.create(data);
    return observation;
  }

  async getObservations(query) {
    const { page, limit, skip } = buildPagination(query.page, query.limit);
    const filter = {};

    if (query.field) {
      filter.field = query.field;
    }

    if (query.startYear || query.endYear) {
      filter.year = {};
      if (query.startYear) filter.year.$gte = Number(query.startYear);
      if (query.endYear) filter.year.$lte = Number(query.endYear);
    }

    const [items, total] = await Promise.all([
      WeatherObservation.find(filter)
        .populate('field', 'name')
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit),
      WeatherObservation.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getObservationById(id) {
    const observation = await WeatherObservation.findById(id).populate('field', 'name');
    if (!observation) {
      throw new AppError('Наблюдение погоды не найдено', 404, [
        { field: 'id', message: 'Наблюдение с указанным идентификатором не существует' },
      ]);
    }
    return observation;
  }

  async updateObservation(id, data) {
    const observation = await WeatherObservation.findById(id);
    if (!observation) {
      throw new AppError('Наблюдение погоды не найдено', 404, [
        { field: 'id', message: 'Наблюдение с указанным идентификатором не существует' },
      ]);
    }
    Object.assign(observation, data);
    await observation.save();
    return observation;
  }

  async deleteObservation(id) {
    const observation = await WeatherObservation.findById(id);
    if (!observation) {
      throw new AppError('Наблюдение погоды не найдено', 404, [
        { field: 'id', message: 'Наблюдение с указанным идентификатором не существует' },
      ]);
    }
    await observation.deleteOne();
    return { message: 'Наблюдение погоды успешно удалено' };
  }
}

export default new WeatherObservationService();