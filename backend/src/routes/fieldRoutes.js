import express from 'express';
import fieldController from '../controllers/fieldController.js';
import validateRequest from '../middlewares/validateRequest.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createFieldValidator,
  updateFieldValidator,
  listFieldsValidator,
} from '../validators/fieldValidators.js';

const router = express.Router();

router.get('/', listFieldsValidator, validateRequest, fieldController.getAll);
router.get('/:id', validateObjectId('id'), fieldController.getById);
router.post('/', createFieldValidator, validateRequest, fieldController.create);
router.patch('/:id', validateObjectId('id'), updateFieldValidator, validateRequest, fieldController.update);
router.delete('/:id', validateObjectId('id'), fieldController.delete);

export default router;