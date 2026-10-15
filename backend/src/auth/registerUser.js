import bcrypt from 'bcrypt';

import { UserAlreadyExistsError } from '../users/inMemoryUserRepository.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;
const BCRYPT_MAX_PASSWORD_BYTES = 72;

export class RegistrationError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'RegistrationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function registerUser(credentials, userRepository) {
  const email = typeof credentials?.email === 'string'
    ? credentials.email.trim().toLowerCase()
    : '';
  const password = credentials?.password;
  const name = typeof credentials?.name === 'string'
    ? credentials.name.trim()
    : undefined;

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new RegistrationError(400, 'INVALID_EMAIL', 'Ingresa un correo válido.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new RegistrationError(
      400,
      'INVALID_PASSWORD',
      'La contraseña debe tener al menos 8 caracteres.',
    );
  }
  if (Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_PASSWORD_BYTES) {
    throw new RegistrationError(
      400,
      'PASSWORD_TOO_LONG',
      'La contraseña supera el límite admitido por bcrypt.',
    );
  }

  if (await userRepository.findByEmail(email)) {
    throw new RegistrationError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'Ya existe una cuenta con ese correo.',
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await userRepository.create({
      email,
      ...(name ? { name } : {}),
      passwordHash,
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      throw new RegistrationError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        'Ya existe una cuenta con ese correo.',
      );
    }
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    ...(user.name ? { name: user.name } : {}),
    createdAt: user.createdAt,
  };
}