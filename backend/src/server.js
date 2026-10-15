import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import {
  registerUser,
  RegistrationError,
} from './auth/registerUser.js';
import {
  AuthenticationError,
  loginUser,
} from './auth/loginUser.js';
import { createAuthMiddleware } from './auth/authMiddleware.js';
import { signAccessToken } from './auth/tokenService.js';
import { inMemoryUserRepository } from './users/inMemoryUserRepository.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET?.trim() ?? '';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1h';
const authenticateJwt = createAuthMiddleware(jwtSecret);
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un número entre 1 y 65535.');
}
if (Buffer.byteLength(jwtSecret, 'utf8') < 32) {
  throw new Error('Configura JWT_SECRET con al menos 32 bytes en backend/.env.');
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.post('/auth/register', async (request, response) => {
  try {
    const user = await registerUser(request.body, inMemoryUserRepository);
    const token = signAccessToken(user, jwtSecret, jwtExpiresIn);
    return response.status(201).json({ success: true, token, user });
  } catch (error) {
    if (error instanceof RegistrationError) {
      return response.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }

    console.error('User registration failed.');
    return response.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'No se pudo crear la cuenta.' },
    });
  }
});

app.post('/auth/login', async (request, response) => {
  try {
    const result = await loginUser(
      request.body,
      inMemoryUserRepository,
      jwtSecret,
      jwtExpiresIn,
    );
    return response.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return response.status(error.statusCode).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }

    console.error('User login failed.');
    return response.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'No se pudo iniciar sesión.' },
    });
  }
});

app.get('/api/profile', authenticateJwt, (request, response) => {
  response.json({
    success: true,
    profile: {
      id: request.auth.userId,
      email: request.auth.email,
    },
  });
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'secureplan-api' });
});

app.listen(port, '0.0.0.0', () => {
  console.info(`SecurePlan API corriendo en http://0.0.0.0:${port}`);
});