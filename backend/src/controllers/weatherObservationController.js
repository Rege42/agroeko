import weatherObservationService from '../services/weatherObservationService.js';
import asyncHandler from '../utils/asyncHandler.js';

class WeatherObservationController {
  create = asyncHandler(async (req, res) => {
    const result = await weatherObservationService.createObservation(req.body);
    return res.status(201).json({
      success: true,
      message: 'Наблюдение погоды успешно создано',
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await weatherObservationService.getObservations(req.query);
    return res.status(200).json({
      success: true,
      message: 'Список наблюдений погоды успешно получен',
      ...result,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const result = await weatherObservationService.getObservationById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Наблюдение погоды успешно получено',
      data: result,
    });
  });

  update = asyncHandler(async (req, res) => {
    const result = await weatherObservationService.updateObservation(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Наблюдение погоды успешно обновлено',
      data: result,
    });
  });

  delete = asyncHandler(async (req, res) => {
    const result = await weatherObservationService.deleteObservation(req.params.id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new WeatherObservationController();