import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAccessToken } from '../services/jwtService.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Неверный логин или пароль',
        },
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Неверный логин или пароль',
        },
      });
    }

    const accessToken = signAccessToken(user);

    return res.json({
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}