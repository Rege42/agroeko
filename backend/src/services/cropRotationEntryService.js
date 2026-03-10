import {
  Crop,
  CropRotationEntry,
  Field,
} from '../models/index.js';
import AppError from '../utils/AppError.js';
import { buildPagination } from '../utils/buildPagination.js';

class CropRotationEntryService {
  async createEntry(data) {
    const [field, crop] = await Promise.all([
      Field.findById(data.field),
      Crop.findById(data.crop),
    ]);

    if (!field) {
      throw new AppError('Поле не найдено', 404, [
        {
          field: 'field',
          message: 'Поле с указанным идентификатором не существует',
        },
      ]);
    }

    if (!crop) {
      throw new AppError('Культура не найдена', 404, [
        {
          field: 'crop',
          message: 'Культура с указанным идентификатором не существует',
        },
      ]);
    }

    const existingEntry = await CropRotationEntry.findOne({
      field: data.field,
      seasonYear: data.seasonYear,
    });

    if (existingEntry) {
      throw new AppError('Запись севооборота для данного поля и сезона уже существует', 409, [
        {
          field: 'seasonYear',
          message: 'Для одного поля может существовать только одна запись на сезон',
        },
      ]);
    }

    if (data.sowingDate && data.harvestDate) {
      const sowingDate = new Date(data.sowingDate);
      const harvestDate = new Date(data.harvestDate);

      if (harvestDate < sowingDate) {
        throw new AppError('Некорректные даты', 400, [
          {
            field: 'harvestDate',
            message: 'Дата уборки не может быть раньше даты посева',
          },
        ]);
      }
    }

    if (
      Array.isArray(crop.suitableSoilTypes) &&
      crop.suitableSoilTypes.length > 0 &&
      !crop.suitableSoilTypes.includes(field.soilType)
    ) {
      throw new AppError('Выбранная культура несовместима с типом почвы поля', 400, [
        {
          field: 'crop',
          message: 'Культура не подходит для выбранного типа почвы',
        },
      ]);
    }

    const entry = await CropRotationEntry.create(data);

    return await entry.populate([
      { path: 'field' },
      { path: 'crop' },
    ]);
  }

  async getEntries(query) {
    const { page, limit, skip } = buildPagination(query.page, query.limit);

    const filter = {};

    if (query.field) {
      filter.field = query.field;
    }

    if (query.crop) {
      filter.crop = query.crop;
    }

    if (query.seasonYear) {
      filter.seasonYear = Number(query.seasonYear);
    }

    if (query.seasonStatus) {
      filter.seasonStatus = query.seasonStatus;
    }

    const [items, total] = await Promise.all([
      CropRotationEntry.find(filter)
        .populate('field')
        .populate('crop')
        .sort({ seasonYear: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CropRotationEntry.countDocuments(filter),
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

  async getEntryById(id) {
    const entry = await CropRotationEntry.findById(id)
      .populate('field')
      .populate('crop');

    if (!entry) {
      throw new AppError('Запись севооборота не найдена', 404, [
        {
          field: 'id',
          message: 'Запись севооборота с указанным идентификатором не существует',
        },
      ]);
    }

    return entry;
  }

  async updateEntry(id, data) {
    const entry = await CropRotationEntry.findById(id);

    if (!entry) {
      throw new AppError('Запись севооборота не найдена', 404, [
        {
          field: 'id',
          message: 'Запись севооборота с указанным идентификатором не существует',
        },
      ]);
    }

    const fieldId = data.field || entry.field;
    const cropId = data.crop || entry.crop;
    const seasonYear = data.seasonYear || entry.seasonYear;

    const [field, crop] = await Promise.all([
      Field.findById(fieldId),
      Crop.findById(cropId),
    ]);

    if (!field) {
      throw new AppError('Поле не найдено', 404, [
        {
          field: 'field',
          message: 'Поле с указанным идентификатором не существует',
        },
      ]);
    }

    if (!crop) {
      throw new AppError('Культура не найдена', 404, [
        {
          field: 'crop',
          message: 'Культура с указанным идентификатором не существует',
        },
      ]);
    }

    const duplicateEntry = await CropRotationEntry.findOne({
      _id: { $ne: id },
      field: fieldId,
      seasonYear,
    });

    if (duplicateEntry) {
      throw new AppError('Запись севооборота для данного поля и сезона уже существует', 409, [
        {
          field: 'seasonYear',
          message: 'Для одного поля может существовать только одна запись на сезон',
        },
      ]);
    }

    const sowingDate = data.sowingDate
      ? new Date(data.sowingDate)
      : entry.sowingDate;

    const harvestDate = data.harvestDate
      ? new Date(data.harvestDate)
      : entry.harvestDate;

    if (sowingDate && harvestDate && harvestDate < sowingDate) {
      throw new AppError('Некорректные даты', 400, [
        {
          field: 'harvestDate',
          message: 'Дата уборки не может быть раньше даты посева',
        },
      ]);
    }

    if (
      Array.isArray(crop.suitableSoilTypes) &&
      crop.suitableSoilTypes.length > 0 &&
      !crop.suitableSoilTypes.includes(field.soilType)
    ) {
      throw new AppError('Выбранная культура несовместима с типом почвы поля', 400, [
        {
          field: 'crop',
          message: 'Культура не подходит для выбранного типа почвы',
        },
      ]);
    }

    Object.assign(entry, data);

    await entry.save();

    return await entry.populate([
      { path: 'field' },
      { path: 'crop' },
    ]);
  }

  async deleteEntry(id) {
    const entry = await CropRotationEntry.findById(id);

    if (!entry) {
      throw new AppError('Запись севооборота не найдена', 404, [
        {
          field: 'id',
          message: 'Запись севооборота с указанным идентификатором не существует',
        },
      ]);
    }

    await entry.deleteOne();

    return {
      message: 'Запись севооборота успешно удалена',
    };
  }
}

export default new CropRotationEntryService();