import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function seedUsers() {
  const users = [
    {
      email: 'agronom@agropole.local',
      password: 'Password123!',
      fullName: 'Главный агроном',
      role: 'AGRONOMIST',
    },
    {
      email: 'director@agropole.local',
      password: 'Password123!',
      fullName: 'Руководитель предприятия',
      role: 'MANAGER',
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) continue;

    const passwordHash = await bcrypt.hash(u.password, 10);

    await User.create({
      email: u.email,
      passwordHash,
      fullName: u.fullName,
      role: u.role,
    });
  }
}