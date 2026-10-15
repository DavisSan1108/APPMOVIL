import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { authApi } from '@/features/auth/data/data-sources/AuthApi';
import { AuthFormLayout } from '@/features/auth/presentation/components/AuthFormLayout';
import { AuthSubmitButton } from '@/features/auth/presentation/components/AuthSubmitButton';
import { AuthTextField } from '@/features/auth/presentation/components/AuthTextField';
import { useAuth } from '@/features/auth/presentation/state/AuthProvider';
import { getEmailError } from '@/features/auth/presentation/utils/validation';

export default function RegisterScreen() {
  const { signInWithToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Ingresa tu nombre.');
      return;
    }

    const emailError = getEmailError(email);
    if (emailError !== null) {
      setErrorMessage(emailError);
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Ingresa una contraseña.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await signInWithToken(result.token, result.sessionData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Crear cuenta"
      subtitle="Regístrate para comenzar."
      footer={
        <Text style={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={styles.link}>
            Inicia sesión
          </Link>
        </Text>
      }
    >
      <AuthTextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        textContentType="name"
        returnKeyType="next"
      />
      <AuthTextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <AuthTextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="next"
      />
      <AuthTextField
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <AuthSubmitButton
        label="Crear cuenta"
        loading={isSubmitting}
        onPress={() => void handleSubmit()}
      />
    </AuthFormLayout>
  );
}

const styles = {
  footerText: { color: '#63746E', fontSize: 14, textAlign: 'center' as const },
  link: { color: '#28715E', fontWeight: '700' as const },
  error: { marginTop: 12, color: '#A33232', fontSize: 14, lineHeight: 20 },
};