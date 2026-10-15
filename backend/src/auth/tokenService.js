import jwt from 'jsonwebtoken';

const JWT_ISSUER = 'secureplan-api';
const JWT_AUDIENCE = 'secureplan-mobile';

export function signAccessToken(user, secret, expiresIn = '1h') {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT secret must be at least 32 bytes.');
  }

  return jwt.sign(
    { email: user.email },
    secret,
    {
      algorithm: 'HS256',
      audience: JWT_AUDIENCE,
      expiresIn,
      issuer: JWT_ISSUER,
      subject: user.id,
    },
  );
}