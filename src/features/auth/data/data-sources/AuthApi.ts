import type { SessionData } from '@/core/storage/secureStorageService';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = LoginCredentials & {
  name: string;
};

type AuthResult = {
  token: string;
  sessionData?: SessionData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function postAuthRequest(
  endpoint: 'login' | 'register',
  body: LoginCredentials | RegisterCredentials,
): Promise<AuthResult> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Configura EXPO_PUBLIC_API_URL para conectar con el servidor.');
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa la URL y la red.');
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const serverMessage = isRecord(responseBody)
      ? responseBody.message ?? responseBody.error
      : null;
    throw new Error(
      typeof serverMessage === 'string'
        ? serverMessage
        : `La solicitud falló (${response.status}).`,
    );
  }

  if (!isRecord(responseBody)) {
    throw new Error('El servidor devolvió una respuesta no válida.');
  }

  const token = responseBody.token ?? responseBody.accessToken;
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('El servidor no devolvió un JWT de acceso.');
  }

  const sessionData = isRecord(responseBody.sessionData)
    ? responseBody.sessionData
    : isRecord(responseBody.user)
      ? { user: responseBody.user }
      : undefined;

  return { token, sessionData };
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    postAuthRequest('login', credentials),
  register: (credentials: RegisterCredentials) =>
    postAuthRequest('register', credentials),
};