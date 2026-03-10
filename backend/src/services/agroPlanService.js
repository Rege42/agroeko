import mongoose from 'mongoose';
import AgroPlan from '../models/AgroPlan.js';
import AgroPlanStep from '../models/AgroPlanStep.js';
import Field from '../models/Field.js';
import CropRotationEntry from '../models/CropRotationEntry.js';
import Recommendation from '../models/Recommendation.js';
import TechnologyTemplate from '../models/TechnologyTemplate.js';
import AppError from '../utils/AppError.js';

class AgroPlanService {
  async createAgroPlan(data) {
    await this.#validateReferences(data);

    const existingPlan = await AgroPlan.findOne({
      cropRotationEntry: data.cropRotationEntry,
    });

    if (existingPlan) {
      throw new AppError('Агроплан для данной записи севооборота уже существует', 409, [
        {
          field: 'cropRotationEntry',
          message: 'Для указанной записи севооборота уже создан агроплан',
        },
      ]);
    }

    const agroPlan = await AgroPlan.create({
      field: data.field,
      cropRotationEntry: data.cropRotationEntry,
      recommendation: data.recommendation || undefined,
      technologyTemplate: data.technologyTemplate || undefined,
      plannedStartDate: data.plannedStartDate || undefined,
      plannedEndDate: data.plannedEndDate || undefined,
      status: data.status || 'draft',
      notes: data.notes?.trim() || undefined,
    });

    return this.getAgroPlanById(agroPlan._id);
  }

  async getAgroPlans(query = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.field) {
      filter.field = query.field;
    }

    if (query.cropRotationEntry) {
      filter.cropRotationEntry = query.cropRotationEntry;
    }

    if (query.recommendation) {
      filter.recommendation = query.recommendation;
    }

    if (query.technologyTemplate) {
      filter.technologyTemplate = query.technologyTemplate;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.plannedStartDateFrom || query.plannedStartDateTo) {
      filter.plannedStartDate = {};

      if (query.plannedStartDateFrom) {
        filter.plannedStartDate.$gte = new Date(query.plannedStartDateFrom);
      }

      if (query.plannedStartDateTo) {
        filter.plannedStartDate.$lte = new Date(query.plannedStartDateTo);
      }
    }

    const [items, total] = await Promise.all([
      AgroPlan.find(filter)
        .populate('field')
        .populate('cropRotationEntry')
        .populate('recommendation')
        .populate('technologyTemplate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AgroPlan.countDocuments(filter),
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

  async getAgroPlanById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Некорректный идентификатор агроплана', 400, [
        { field: 'id', message: 'Некорректный формат идентификатора' },
      ]);
    }

    const agroPlan = await AgroPlan.findById(id)
      .populate('field')
      .populate('cropRotationEntry')
      .populate('recommendation')
      .populate('technologyTemplate');

    if (!agroPlan) {
      throw new AppError('Агроплан не найден', 404, [
        { field: 'id', message: 'Агроплан с указанным идентификатором не существует' },
      ]);
    }

    return agroPlan;
  }

  async updateAgroPlan(id, data) {
    const agroPlan = await AgroPlan.findById(id);

    if (!agroPlan) {
      throw new AppError('Агроплан не найден', 404, [
        { field: 'id', message: 'Агроплан с указанным идентификатором не существует' },
      ]);
    }

    await this.#validateReferences(data, true);

    if (
      data.cropRotationEntry &&
      String(data.cropRotationEntry) !== String(agroPlan.cropRotationEntry)
    ) {
      const existingPlan = await AgroPlan.findOne({
        _id: { $ne: id },
        cropRotationEntry: data.cropRotationEntry,
      });

      if (existingPlan) {
        throw new AppError('Агроплан для данной записи севооборота уже существует', 409, [
          {
            field: 'cropRotationEntry',
            message: 'Для указанной записи севооборота уже создан агроплан',
          },
        ]);
      }
    }

    Object.assign(agroPlan, {
      field: data.field ?? agroPlan.field,
      cropRotationEntry: data.cropRotationEntry ?? agroPlan.cropRotationEntry,
      recommendation:
        data.recommendation !== undefined ? data.recommendation || null : agroPlan.recommendation,
      technologyTemplate:
        data.technologyTemplate !== undefined
          ? data.technologyTemplate || null
          : agroPlan.technologyTemplate,
      plannedStartDate:
        data.plannedStartDate !== undefined
          ? data.plannedStartDate || null
          : agroPlan.plannedStartDate,
      plannedEndDate:
        data.plannedEndDate !== undefined ? data.plannedEndDate || null : agroPlan.plannedEndDate,
      status: data.status ?? agroPlan.status,
      notes: data.notes !== undefined ? data.notes?.trim() || null : agroPlan.notes,
    });

    await agroPlan.save();

    return this.getAgroPlanById(id);
  }

  async deleteAgroPlan(id) {
    const agroPlan = await AgroPlan.findById(id);

    if (!agroPlan) {
      throw new AppError('Агроплан не найден', 404, [
        { field: 'id', message: 'Агроплан с указанным идентификатором не существует' },
      ]);
    }

    await AgroPlanStep.deleteMany({ agroPlan: agroPlan._id });
    await agroPlan.deleteOne();

    return {
      message: 'Агроплан успешно удалён',
    };
  }

  async #validateReferences(data, isPartial = false) {
    const checks = [];

    if (!isPartial || data.field !== undefined) {
      if (!data.field) {
        throw new AppError('Поле обязательно', 400, [
          { field: 'field', message: 'Поле field является обязательным' },
        ]);
      }

      checks.push(
        Field.findById(data.field).then((field) => {
          if (!field) {
            throw new AppError('Поле не найдено', 404, [
              { field: 'field', message: 'Указанное поле не существует' },
            ]);
          }
        })
      );
    }

    if (!isPartial || data.cropRotationEntry !== undefined) {
      if (!data.cropRotationEntry) {
        throw new AppError('Запись севооборота обязательна', 400, [
          {
            field: 'cropRotationEntry',
            message: 'Поле cropRotationEntry является обязательным',
          },
        ]);
      }

      checks.push(
        CropRotationEntry.findById(data.cropRotationEntry).then((entry) => {
          if (!entry) {
            throw new AppError('Запись севооборота не найдена', 404, [
              {
                field: 'cropRotationEntry',
                message: 'Указанная запись севооборота не существует',
              },
            ]);
          }
        })
      );
    }

    if (data.recommendation) {
      checks.push(
        Recommendation.findById(data.recommendation).then((recommendation) => {
          if (!recommendation) {
            throw new AppError('Рекомендация не найдена', 404, [
              { field: 'recommendation', message: 'Указанная рекомендация не существует' },
            ]);
          }
        })
      );
    }

    if (data.technologyTemplate) {
      checks.push(
        TechnologyTemplate.findById(data.technologyTemplate).then((template) => {
          if (!template) {
            throw new AppError('Технологический шаблон не найден', 404, [
              {
                field: 'technologyTemplate',
                message: 'Указанный технологический шаблон не существует',
              },
            ]);
          }
        })
      );
    }

    await Promise.all(checks);
  }
}

export default new AgroPlanService();