const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(email: string): string | null {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return 'Ingresa tu correo electrónico.';
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Ingresa un correo electrónico válido.';
  }
  return null;
}