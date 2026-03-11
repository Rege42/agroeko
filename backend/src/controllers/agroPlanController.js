import agroPlanService from "../services/agroPlanService.js";

class AgroPlanController {
  async createAgroPlan(req, res, next) {
    try {
      const agroPlan = await agroPlanService.createAgroPlan(req.body);

      res.status(201).json({
        message: 'Агроплан успешно создан',
        data: agroPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgroPlans(req, res, next) {
    try {
      const result = await agroPlanService.getAgroPlans(req.query);

      res.status(200).json({
        message: 'Агропланы успешно получены',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgroPlanById(req, res, next) {
    try {
      const agroPlan = await agroPlanService.getAgroPlanById(req.params.id);

      res.status(200).json({
        message: 'Агроплан успешно получен',
        data: agroPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAgroPlan(req, res, next) {
    try {
      const agroPlan = await agroPlanService.updateAgroPlan(req.params.id, req.body);

      res.status(200).json({
        message: 'Агроплан успешно обновлён',
        data: agroPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAgroPlan(req, res, next) {
    try {
      const result = await agroPlanService.deleteAgroPlan(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AgroPlanController();