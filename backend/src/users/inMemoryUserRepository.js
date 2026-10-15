import { randomUUID } from 'node:crypto';

const usersByEmail = new Map();

export class UserAlreadyExistsError extends Error {
  constructor(email) {
    super(`A user with email ${email} already exists.`);
    this.name = 'UserAlreadyExistsError';
  }
}

export const inMemoryUserRepository = {
  async findByEmail(email) {
    return usersByEmail.get(email) ?? null;
  },

  async create({ email, name, passwordHash }) {
    if (usersByEmail.has(email)) {
      throw new UserAlreadyExistsError(email);
    }

    const user = {
      id: randomUUID(),
      email,
      ...(name ? { name } : {}),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(email, user);
    return user;
  },
};