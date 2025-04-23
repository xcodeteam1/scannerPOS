import * as jwt from 'jsonwebtoken';

export function generateJWT(user: { id: number; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ id: user.id, role: user.role }, secret, {
    algorithm: 'HS256',
    expiresIn: '10h',
  });
}
