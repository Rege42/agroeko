import mongoose from 'mongoose';
import AgroPlan from '../models/AgroPlan.js';
import AgroPlanStep from '../models/AgroPlanStep.js';
import AppError from '../utils/AppError.js';

class AgroPlanStepService {
  async createAgroPlanStep(data) {
    await this.#validateAgroPlanExists(data.agroPlan);
    await this.#validateOrderUniqueness(data.agroPlan, data.order);

    const step = await AgroPlanStep.create({
      agroPlan: data.agroPlan,
      order: data.order,
      name: data.name?.trim(),
      stepType: data.stepType || 'other',
      plannedDate: data.plannedDate || undefined,
      actualDate: data.actualDate || undefined,
      status: data.status || 'pending',
      deviationReason: data.deviationReason?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    });

    return this.getAgroPlanStepById(step._id);
  }

  async getAgroPlanSteps(query = {}) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.agroPlan) {
      filter.agroPlan = query.agroPlan;
    }

    if (query.stepType) {
      filter.stepType = query.stepType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      AgroPlanStep.find(filter)
        .populate({
          path: 'agroPlan',
          populate: [
            { path: 'field' },
            { path: 'cropRotationEntry' },
          ],
        })
        .sort({ agroPlan: 1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AgroPlanStep.countDocuments(filter),
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

  async getAgroPlanStepById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Некорректный идентификатор шага агроплана', 400, [
        { field: 'id', message: 'Некорректный формат идентификатора' },
      ]);
    }

    const step = await AgroPlanStep.findById(id).populate({
      path: 'agroPlan',
      populate: [
        { path: 'field' },
        { path: 'cropRotationEntry' },
      ],
    });

    if (!step) {
      throw new AppError('Шаг агроплана не найден', 404, [
        { field: 'id', message: 'Шаг агроплана с указанным идентификатором не существует' },
      ]);
    }

    return step;
  }

  async updateAgroPlanStep(id, data) {
    const step = await AgroPlanStep.findById(id);

    if (!step) {
      throw new AppError('Шаг агроплана не найден', 404, [
        { field: 'id', message: 'Шаг агроплана с указанным идентификатором не существует' },
      ]);
    }

    const targetAgroPlan = data.agroPlan ?? step.agroPlan;
    const targetOrder = data.order ?? step.order;

    if (data.agroPlan !== undefined) {
      await this.#validateAgroPlanExists(data.agroPlan);
    }

    if (
      String(targetAgroPlan) !== String(step.agroPlan) ||
      Number(targetOrder) !== Number(step.order)
    ) {
      await this.#validateOrderUniqueness(targetAgroPlan, targetOrder, id);
    }

    Object.assign(step, {
      agroPlan: targetAgroPlan,
      order: targetOrder,
      name: data.name !== undefined ? data.name?.trim() : step.name,
      stepType: data.stepType ?? step.stepType,
      plannedDate: data.plannedDate !== undefined ? data.plannedDate || null : step.plannedDate,
      actualDate: data.actualDate !== undefined ? data.actualDate || null : step.actualDate,
      status: data.status ?? step.status,
      deviationReason:
        data.deviationReason !== undefined
          ? data.deviationReason?.trim() || null
          : step.deviationReason,
      notes: data.notes !== undefined ? data.notes?.trim() || null : step.notes,
    });

    await step.save();

    return this.getAgroPlanStepById(id);
  }

  async deleteAgroPlanStep(id) {
    const step = await AgroPlanStep.findById(id);

    if (!step) {
      throw new AppError('Шаг агроплана не найден', 404, [
        { field: 'id', message: 'Шаг агроплана с указанным идентификатором не существует' },
      ]);
    }

    await step.deleteOne();

    return {
      message: 'Шаг агроплана успешно удалён',
    };
  }

  async #validateAgroPlanExists(agroPlanId) {
    const agroPlan = await AgroPlan.findById(agroPlanId);

    if (!agroPlan) {
      throw new AppError('Агроплан не найден', 404, [
        { field: 'agroPlan', message: 'Указанный агроплан не существует' },
      ]);
    }
  }

  async #validateOrderUniqueness(agroPlanId, order, excludeId = null) {
    const filter = {
      agroPlan: agroPlanId,
      order,
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existingStep = await AgroPlanStep.findOne(filter);

    if (existingStep) {
      throw new AppError('Порядковый номер шага уже используется', 409, [
        {
          field: 'order',
          message: 'В рамках данного агроплана шаг с таким порядковым номером уже существует',
        },
      ]);
    }
  }
}

export default new AgroPlanStepService();