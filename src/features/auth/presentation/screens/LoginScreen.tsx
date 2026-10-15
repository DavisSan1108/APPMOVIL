import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { authApi } from '@/features/auth/data/data-sources/AuthApi';
import { AuthFormLayout } from '@/features/auth/presentation/components/AuthFormLayout';
import { AuthSubmitButton } from '@/features/auth/presentation/components/AuthSubmitButton';
import { AuthTextField } from '@/features/auth/presentation/components/AuthTextField';
import { useAuth } from '@/features/auth/presentation/state/AuthProvider';
import { getEmailError } from '@/features/auth/presentation/utils/validation';

export default function LoginScreen() {
  const { signInWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const emailError = getEmailError(email);
    if (emailError !== null) {
      setErrorMessage(emailError);
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.login({ email: email.trim(), password });
      await signInWithToken(result.token, result.sessionData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta de SecurePlan."
      footer={
        <Text style={styles.footerText}>
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" style={styles.link}>
            Regístrate
          </Link>
        </Text>
      }
    >
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
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <AuthSubmitButton
        label="Iniciar sesión"
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