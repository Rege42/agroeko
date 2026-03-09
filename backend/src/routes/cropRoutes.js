import express from 'express';
import cropController from '../controllers/cropController.js';
import validateRequest from '../middlewares/validateRequest.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createCropValidator,
  updateCropValidator,
  listCropsValidator,
} from '../validators/cropValidators.js';

const router = express.Router();

router.get('/', listCropsValidator, validateRequest, cropController.getAll);
router.get('/:id', validateObjectId('id'), cropController.getById);
router.post('/', createCropValidator, validateRequest, cropController.create);
router.patch('/:id', validateObjectId('id'), updateCropValidator, validateRequest, cropController.update);
router.delete('/:id', validateObjectId('id'), cropController.delete);

export default router;