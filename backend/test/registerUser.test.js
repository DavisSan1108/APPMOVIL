import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcrypt';

import {
  registerUser,
  RegistrationError,
} from '../src/auth/registerUser.js';

function createTestRepository() {
  const users = new Map();

  return {
    users,
    async findByEmail(email) {
      return users.get(email) ?? null;
    },
    async create(user) {
      if (users.has(user.email)) {
        const error = new Error('Duplicate email');
        error.code = 'USER_ALREADY_EXISTS';
        throw error;
      }
      const storedUser = {
        id: 'test-user-id',
        ...user,
        createdAt: '2026-10-14T00:00:00.000Z',
      };
      users.set(user.email, storedUser);
      return storedUser;
    },
  };
}

test('registerUser stores a bcrypt hash and never returns it', async () => {
  const repository = createTestRepository();
  const password = 'SecurePass123';

  const user = await registerUser(
    { email: '  USER@example.com ', password },
    repository,
  );

  const storedUser = repository.users.get('user@example.com');
  assert.equal(user.email, 'user@example.com');
  assert.equal('password' in user, false);
  assert.equal('passwordHash' in user, false);
  assert.match(storedUser.passwordHash, /^\$2[aby]\$/);
  assert.equal(await bcrypt.compare(password, storedUser.passwordHash), true);
});

test('registerUser rejects invalid email and short passwords', async () => {
  const repository = createTestRepository();

  await assert.rejects(
    registerUser({ email: 'bad-email', password: 'long-enough-password' }, repository),
    (error) => error instanceof RegistrationError && error.code === 'INVALID_EMAIL',
  );
  await assert.rejects(
    registerUser({ email: 'user@example.com', password: 'short' }, repository),
    (error) => error instanceof RegistrationError && error.code === 'INVALID_PASSWORD',
  );
});

test('registerUser rejects duplicate email addresses', async () => {
  const repository = createTestRepository();
  const credentials = { email: 'user@example.com', password: 'SecurePass123' };

  await registerUser(credentials, repository);
  await assert.rejects(
    registerUser(credentials, repository),
    (error) => error instanceof RegistrationError && error.code === 'EMAIL_ALREADY_REGISTERED',
  );
});