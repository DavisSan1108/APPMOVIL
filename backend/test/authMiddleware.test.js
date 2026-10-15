import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

import { createAuthMiddleware } from '../src/auth/authMiddleware.js';

const jwtSecret = 'test-secret-with-at-least-32-bytes-long';

function invokeMiddleware(authorization) {
  const request = {
    auth: undefined,
    get(headerName) {
      return headerName.toLowerCase() === 'authorization'
        ? authorization
        : undefined;
    },
  };
  const response = {
    statusCode: 200,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  createAuthMiddleware(jwtSecret)(request, response, () => {
    nextCalled = true;
  });

  return { request, response, nextCalled };
}

function createToken(secret = jwtSecret, expiresIn = '1h') {
  return jwt.sign(
    { email: 'user@example.com' },
    secret,
    {
      algorithm: 'HS256',
      audience: 'secureplan-mobile',
      expiresIn,
      issuer: 'secureplan-api',
      subject: 'test-user-id',
    },
  );
}

test('protected middleware rejects a missing bearer token with 401', () => {
  const { response, nextCalled } = invokeMiddleware(undefined);

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
  assert.equal(nextCalled, false);
});

test('protected middleware rejects invalid and expired tokens with 401', () => {
  const invalid = invokeMiddleware('Bearer not-a-jwt');
  const wrongSignature = invokeMiddleware(`Bearer ${createToken('wrong-secret-that-is-also-long-enough')}`);
  const expired = invokeMiddleware(`Bearer ${createToken(jwtSecret, '-1s')}`);

  for (const result of [invalid, wrongSignature, expired]) {
    assert.equal(result.response.statusCode, 401);
    assert.equal(result.nextCalled, false);
  }
});

test('protected middleware accepts a valid signed token and attaches claims', () => {
  const token = createToken();
  const { request, response, nextCalled } = invokeMiddleware(`Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(request.auth, {
    userId: 'test-user-id',
    email: 'user@example.com',
  });
});