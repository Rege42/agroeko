import soilAnalysisService from '../services/soilAnalysisService.js';
import asyncHandler from '../utils/asyncHandler.js';

class SoilAnalysisController {
  create = asyncHandler(async (req, res) => {
    const result = await soilAnalysisService.createAnalysis(req.body);
    return res.status(201).json({
      success: true,
      message: 'Анализ почвы успешно создан',
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await soilAnalysisService.getAnalyses(req.query);
    return res.status(200).json({
      success: true,
      message: 'Список анализов почвы успешно получен',
      ...result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const result = await soilAnalysisService.getAnalysisById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Анализ почвы успешно получен',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const result = await soilAnalysisService.updateAnalysis(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Анализ почвы успешно обновлён',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const result = await soilAnalysisService.deleteAnalysis(req.params.id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new SoilAnalysisController();