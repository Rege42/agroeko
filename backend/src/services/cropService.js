import { Crop } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { buildPagination } from '../utils/buildPagination.js';

class CropService {
  async createCrop(data) {
    const existingCrop = await Crop.findOne({ name: data.name.trim() });

    if (existingCrop) {
      throw new AppError('Культура с таким названием уже существует', 409, [
        {
          field: 'name',
          message: 'Название культуры должно быть уникальным',
        },
      ]);
    }

    const crop = await Crop.create({
      ...data,
      name: data.name.trim(),
    });

    return crop;
  }

  async getCrops(query) {
    const { page, limit, skip } = buildPagination(query.page, query.limit);

    const filter = {};

    if (query.type) {
      filter.type = query.type;
    }

    const [items, total] = await Promise.all([
      Crop.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Crop.countDocuments(filter),
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

  async getCropById(id) {
    const crop = await Crop.findById(id);

    if (!crop) {
      throw new AppError('Культура не найдена', 404, [
        {
          field: 'id',
          message: 'Культура с указанным идентификатором не существует',
        },
      ]);
    }

    return crop;
  }

  async updateCrop(id, data) {
    const crop = await Crop.findById(id);

    if (!crop) {
      throw new AppError('Культура не найдена', 404, [
        {
          field: 'id',
          message: 'Культура с указанным идентификатором не существует',
        },
      ]);
    }

    if (data.name && data.name.trim() !== crop.name) {
      const existingCrop = await Crop.findOne({
        _id: { $ne: id },
        name: data.name.trim(),
      });

      if (existingCrop) {
        throw new AppError('Культура с таким названием уже существует', 409, [
          {
            field: 'name',
            message: 'Название культуры должно быть уникальным',
          },
        ]);
      }
    }

    Object.assign(crop, {
      ...data,
      name: data.name ? data.name.trim() : crop.name,
    });

    await crop.save();

    return crop;
  }

  async deleteCrop(id) {
    const crop = await Crop.findById(id);

    if (!crop) {
      throw new AppError('Культура не найдена', 404, [
        {
          field: 'id',
          message: 'Культура с указанным идентификатором не существует',
        },
      ]);
    }

    await crop.deleteOne();

    return {
      message: 'Культура успешно удалена',
    };
  }
}

export default new CropService();