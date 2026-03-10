import agroPlanStepService from "../services/agroPlanStepService.js";

class AgroPlanStepController {
  async createAgroPlanStep(req, res, next) {
    try {
      const step = await agroPlanStepService.createAgroPlanStep(req.body);

      res.status(201).json({
        message: 'Шаг агроплана успешно создан',
        data: step,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgroPlanSteps(req, res, next) {
    try {
      const result = await agroPlanStepService.getAgroPlanSteps(req.query);

      res.status(200).json({
        message: 'Шаги агроплана успешно получены',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgroPlanStepById(req, res, next) {
    try {
      const step = await agroPlanStepService.getAgroPlanStepById(req.params.id);

      res.status(200).json({
        message: 'Шаг агроплана успешно получен',
        data: step,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAgroPlanStep(req, res, next) {
    try {
      const step = await agroPlanStepService.updateAgroPlanStep(req.params.id, req.body);

      res.status(200).json({
        message: 'Шаг агроплана успешно обновлён',
        data: step,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAgroPlanStep(req, res, next) {
    try {
      const result = await agroPlanStepService.deleteAgroPlanStep(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AgroPlanStepController();