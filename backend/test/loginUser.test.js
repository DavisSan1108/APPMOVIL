import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  AuthenticationError,
  loginUser,
} from '../src/auth/loginUser.js';

const jwtSecret = 'test-secret-with-at-least-32-bytes-long';
const password = 'SecurePass123';

async function createRepository() {
  const passwordHash = await bcrypt.hash(password, 4);
  const user = {
    id: 'test-user-id',
    email: 'user@example.com',
    passwordHash,
    createdAt: '2026-10-14T00:00:00.000Z',
  };

  return {
    user,
    async findByEmail(email) {
      return email === user.email ? user : null;
    },
  };
}

test('loginUser verifies the password and returns a signed one-hour JWT', async () => {
  const repository = await createRepository();
  const result = await loginUser(
    { email: ' USER@example.com ', password },
    repository,
    jwtSecret,
  );

  const decoded = jwt.verify(result.token, jwtSecret, {
    algorithms: ['HS256'],
    audience: 'secureplan-mobile',
    issuer: 'secureplan-api',
  });

  assert.equal(decoded.sub, repository.user.id);
  assert.equal(decoded.email, repository.user.email);
  assert.equal(decoded.exp - decoded.iat, 3600);
  assert.equal(result.user.email, repository.user.email);
  assert.equal('passwordHash' in result.user, false);
});

test('loginUser returns the same unauthorized error for unknown users and bad passwords', async () => {
  const repository = await createRepository();

  await assert.rejects(
    loginUser({ email: 'missing@example.com', password }, repository, jwtSecret),
    (error) => error instanceof AuthenticationError && error.code === 'INVALID_CREDENTIALS',
  );
  await assert.rejects(
    loginUser(
      { email: 'user@example.com', password: 'WrongPass123' },
      repository,
      jwtSecret,
    ),
    (error) => error instanceof AuthenticationError && error.code === 'INVALID_CREDENTIALS',
  );
});

test('loginUser rejects passwords that exceed bcrypt input limits', async () => {
  const repository = await createRepository();

  await assert.rejects(
    loginUser(
      { email: 'user@example.com', password: 'a'.repeat(73) },
      repository,
      jwtSecret,
    ),
    (error) =>
      error instanceof AuthenticationError &&
      error.code === 'INVALID_CREDENTIALS_FORMAT',
  );
});