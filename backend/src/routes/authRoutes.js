import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { loginValidator } from '../validators/authValidators.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

router.post('/login', loginValidator, validateRequest, login);

export default router;