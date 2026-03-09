import express from 'express';
import cropRotationEntryController from '../controllers/cropRotationEntryController.js';
import validateRequest from '../middlewares/validateRequest.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createCropRotationEntryValidator,
  updateCropRotationEntryValidator,
  listCropRotationEntriesValidator,
} from '../validators/cropRotationEntryValidators.js';

const router = express.Router();

router.get('/', listCropRotationEntriesValidator, validateRequest, cropRotationEntryController.getAll);
router.get('/:id', validateObjectId('id'), cropRotationEntryController.getById);
router.post('/', createCropRotationEntryValidator, validateRequest, cropRotationEntryController.create);
router.patch('/:id',validateObjectId('id'),updateCropRotationEntryValidator,validateRequest,cropRotationEntryController.update);
router.delete('/:id', validateObjectId('id'), cropRotationEntryController.delete);

export default router;