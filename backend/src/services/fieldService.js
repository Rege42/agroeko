import { Field } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { buildPagination } from "../utils/buildPagination.js";

class FieldService {
  async createField(data) {
    const existingField = await Field.findOne({ name: data.name.trim() });

    if (existingField) {
      throw new AppError("Поле с таким названием уже существует", 409, [
        {
          field: "name",
          message: "Название поля должно быть уникальным",
        },
      ]);
    }

    const field = await Field.create({
      ...data,
      name: data.name.trim(),
    });

    return field;
  }

  async getFields(query) {
    const { page, limit, skip } = buildPagination(query.page, query.limit);

    const filter = {};

    if (query.soilType) {
      filter.soilType = query.soilType;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true";
    }

    if (query.search && query.search.trim()) {
      filter.name = {
        $regex: query.search.trim(),
        $options: "i",
      };
    }

    const [items, total] = await Promise.all([
      Field.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Field.countDocuments(filter),
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

  async getFieldById(id) {
    const field = await Field.findById(id);

    if (!field) {
      throw new AppError("Поле не найдено", 404, [
        {
          field: "id",
          message: "Поле с указанным идентификатором не существует",
        },
      ]);
    }

    return field;
  }

  async updateField(id, data) {
    const field = await Field.findById(id);

    if (!field) {
      throw new AppError("Поле не найдено", 404, [
        {
          field: "id",
          message: "Поле с указанным идентификатором не существует",
        },
      ]);
    }

    if (data.name && data.name.trim() !== field.name) {
      const existingField = await Field.findOne({
        _id: { $ne: id },
        name: data.name.trim(),
      });

      if (existingField) {
        throw new AppError("Поле с таким названием уже существует", 409, [
          {
            field: "name",
            message: "Название поля должно быть уникальным",
          },
        ]);
      }
    }

    Object.assign(field, {
      ...data,
      name: data.name ? data.name.trim() : field.name,
    });

    await field.save();

    return field;
  }

  async deleteField(id) {
    const field = await Field.findById(id);

    if (!field) {
      throw new AppError("Поле не найдено", 404, [
        {
          field: "id",
          message: "Поле с указанным идентификатором не существует",
        },
      ]);
    }

    await field.deleteOne();

    return {
      message: "Поле успешно удалено",
    };
  }
}

export default new FieldService();
