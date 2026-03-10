import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Требуется Bearer token',
        },
      });
    }

    const token = authHeader.slice(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'agropole-api',
      audience: 'agropole-web',
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Недействительный или просроченный токен',
      },
    });
  }
}