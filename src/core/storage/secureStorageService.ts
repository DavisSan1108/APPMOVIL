import * as SecureStore from 'expo-secure-store';

export class SecureStorageError extends Error {
  constructor(
    public readonly operation: string,
    public readonly originalError: unknown,
  ) {
    super(`Secure storage operation "${operation}" failed.`);
    this.name = 'SecureStorageError';
  }
}

export type SessionData = Record<string, unknown>;

export class SecureStorageService {
  private static readonly tokenKey = 'secureplan.jwt';
  private static readonly sessionKey = 'secureplan.session';

  async saveToken(token: string): Promise<void> {
    if (!token.trim()) {
      throw new TypeError('Token cannot be empty.');
    }

    try {
      await SecureStore.setItemAsync(SecureStorageService.tokenKey, token);
    } catch (error) {
      throw new SecureStorageError('saveToken', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SecureStorageService.tokenKey);
    } catch (error) {
      throw new SecureStorageError('getToken', error);
    }
  }

  async verifyTokenReadForDevelopment(): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') return false;

    const token = await this.getToken();
    if (token === null) {
      console.warn('[SecureStore] JWT was not found after saving.');
      return false;
    }

    const maskedToken = token.length > 12
      ? `${token.slice(0, 8)}...${token.slice(-4)}`
      : '[masked]';
    console.info(`[SecureStore] JWT read successfully: ${maskedToken}`);
    return true;
  }

  async deleteToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SecureStorageService.tokenKey);
    } catch (error) {
      throw new SecureStorageError('deleteToken', error);
    }
  }

  async saveSessionData(sessionData: SessionData): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        SecureStorageService.sessionKey,
        JSON.stringify(sessionData),
      );
    } catch (error) {
      throw new SecureStorageError('saveSessionData', error);
    }
  }

  async getSessionData(): Promise<SessionData | null> {
    try {
      const storedValue = await SecureStore.getItemAsync(
        SecureStorageService.sessionKey,
      );
      if (storedValue === null) return null;

      const parsed: unknown = JSON.parse(storedValue);
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        throw new TypeError('Stored session data is not a JSON object.');
      }

      return parsed as SessionData;
    } catch (error) {
      throw new SecureStorageError('getSessionData', error);
    }
  }

  async deleteSessionData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SecureStorageService.sessionKey);
    } catch (error) {
      throw new SecureStorageError('deleteSessionData', error);
    }
  }
}

export const secureStorageService = new SecureStorageService();