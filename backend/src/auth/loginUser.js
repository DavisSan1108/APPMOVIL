import bcrypt from 'bcrypt';

import { signAccessToken } from './tokenService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_MAX_PASSWORD_BYTES = 72;

export class AuthenticationError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function loginUser(
  credentials,
  userRepository,
  jwtSecret,
  jwtExpiresIn = '1h',
) {
  const email = typeof credentials?.email === 'string'
    ? credentials.email.trim().toLowerCase()
    : '';
  const password = credentials?.password;

  if (
    !email ||
    !EMAIL_PATTERN.test(email) ||
    typeof password !== 'string' ||
    !password ||
    Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_PASSWORD_BYTES
  ) {
    throw new AuthenticationError(
      400,
      'INVALID_CREDENTIALS_FORMAT',
      'Correo o contraseña con formato inválido.',
    );
  }

  const user = await userRepository.findByEmail(email);
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    throw new AuthenticationError(
      401,
      'INVALID_CREDENTIALS',
      'Correo o contraseña incorrectos.',
    );
  }

  const publicUser = {
    id: user.id,
    email: user.email,
    ...(user.name ? { name: user.name } : {}),
    createdAt: user.createdAt,
  };

  return {
    token: signAccessToken(user, jwtSecret, jwtExpiresIn),
    user: publicUser,
  };
}