import cropRotationEntryService from '../services/cropRotationEntryService.js';
import asyncHandler from '../utils/asyncHandler.js';

class CropRotationEntryController {
  create = asyncHandler(async (req, res) => {
    const result = await cropRotationEntryService.createEntry(req.body);

    return res.status(201).json({
      success: true,
      message: 'Запись севооборота успешно создана',
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await cropRotationEntryService.getEntries(req.query);

    return res.status(200).json({
      success: true,
      message: 'Список записей севооборота успешно получен',
      ...result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const result = await cropRotationEntryService.getEntryById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Запись севооборота успешно получена',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const result = await cropRotationEntryService.updateEntry(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Запись севооборота успешно обновлена',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const result = await cropRotationEntryService.deleteEntry(req.params.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new CropRotationEntryController();