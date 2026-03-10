import { SoilAnalysis, Field } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { buildPagination } from '../utils/buildPagination.js';

class SoilAnalysisService {
  async createAnalysis(data) {
    // Проверка существования поля (если нужно)
    const field = await Field.findById(data.field);
    if (!field) {
      throw new AppError('Поле не найдено', 404, [
        { field: 'field', message: 'Поле с указанным идентификатором не существует' },
      ]);
    }
    const analysis = await SoilAnalysis.create(data);
    return analysis;
  }

  async getAnalyses(query) {
    const { page, limit, skip } = buildPagination(query.page, query.limit);
    const filter = {};

    if (query.field) {
      filter.field = query.field;
    }

    if (query.startDate || query.endDate) {
      filter.analysisDate = {};
      if (query.startDate) filter.analysisDate.$gte = new Date(query.startDate);
      if (query.endDate) filter.analysisDate.$lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      SoilAnalysis.find(filter)
        .populate('field', 'name')
        .sort({ analysisDate: -1 })
        .skip(skip)
        .limit(limit),
      SoilAnalysis.countDocuments(filter),
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

  async getAnalysisById(id) {
    const analysis = await SoilAnalysis.findById(id).populate('field', 'name');
    if (!analysis) {
      throw new AppError('Анализ почвы не найден', 404, [
        { field: 'id', message: 'Анализ с указанным идентификатором не существует' },
      ]);
    }
    return analysis;
  }

  async updateAnalysis(id, data) {
    const analysis = await SoilAnalysis.findById(id);
    if (!analysis) {
      throw new AppError('Анализ почвы не найден', 404, [
        { field: 'id', message: 'Анализ с указанным идентификатором не существует' },
      ]);
    }
    Object.assign(analysis, data);
    await analysis.save();
    return analysis;
  }

  async deleteAnalysis(id) {
    const analysis = await SoilAnalysis.findById(id);
    if (!analysis) {
      throw new AppError('Анализ почвы не найден', 404, [
        { field: 'id', message: 'Анализ с указанным идентификатором не существует' },
      ]);
    }
    await analysis.deleteOne();
    return { message: 'Анализ почвы успешно удалён' };
  }
}

export default new SoilAnalysisService();