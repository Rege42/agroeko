import fieldService from '../services/fieldService.js';
import asyncHandler from '../utils/asyncHandler.js';

class FieldController {
  create = asyncHandler(async (req, res) => {
    const result = await fieldService.createField(req.body);

    return res.status(201).json({
      success: true,
      message: 'Поле успешно создано',
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await fieldService.getFields(req.query);

    return res.status(200).json({
      success: true,
      message: 'Список полей успешно получен',
      ...result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const result = await fieldService.getFieldById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Поле успешно получено',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const result = await fieldService.updateField(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Поле успешно обновлено',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const result = await fieldService.deleteField(req.params.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new FieldController();