import jwt from 'jsonwebtoken';

const JWT_ISSUER = 'secureplan-api';
const JWT_AUDIENCE = 'secureplan-mobile';

function unauthorized(response) {
  return response.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Token de acceso requerido o inválido.',
    },
  });
}

export function createAuthMiddleware(secret) {
  return function authenticateJwt(request, response, next) {
    const authorization = request.get('authorization') ?? '';
    const bearerMatch = authorization.match(/^Bearer\s+(\S+)$/i);
    if (!bearerMatch) return unauthorized(response);

    try {
      const payload = jwt.verify(bearerMatch[1], secret, {
        algorithms: ['HS256'],
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
      });

      if (
        typeof payload === 'string' ||
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string'
      ) {
        return unauthorized(response);
      }

      request.auth = { userId: payload.sub, email: payload.email };
      return next();
    } catch {
      return unauthorized(response);
    }
  };
}