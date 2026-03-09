import cropService from '../services/cropService.js';
import asyncHandler from '../utils/asyncHandler.js';

class CropController {
  create = asyncHandler(async (req, res) => {
    const result = await cropService.createCrop(req.body);

    return res.status(201).json({
      success: true,
      message: 'Культура успешно создана',
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await cropService.getCrops(req.query);

    return res.status(200).json({
      success: true,
      message: 'Список культур успешно получен',
      ...result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const result = await cropService.getCropById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Культура успешно получена',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const result = await cropService.updateCrop(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Культура успешно обновлена',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const result = await cropService.deleteCrop(req.params.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new CropController();