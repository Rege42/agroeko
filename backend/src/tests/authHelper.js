import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const ROLES = {
  AGRONOMIST: 'AGRONOMIST',
  MANAGER: 'MANAGER',
};

export async function createTestUser(role = ROLES.AGRONOMIST, overrides = {}) {
  const passwordHash = overrides.passwordHash || await bcrypt.hash('test12345', 10);

  const user = await User.create({
    fullName: overrides.fullName || 'Тестовый пользователь',
    email: overrides.email || `test_${Date.now()}@mail.ru`,
    passwordHash,
    role,
    ...overrides,
  });

  return user;
}

export function generateTestToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET || 'test_secret',
    {
      expiresIn: '1h',
      issuer: 'agropole-api',
      audience: 'agropole-web',
    }
  );
}

export async function createUserAndToken(role = ROLES.AGRONOMIST, overrides = {}) {
  const user = await createTestUser(role, overrides);
  const token = generateTestToken(user);

  return { user, token };
}