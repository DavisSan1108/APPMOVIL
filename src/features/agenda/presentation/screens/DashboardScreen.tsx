import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/presentation/state/AuthProvider';

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [signOutError, setSignOutError] = useState(false);

  const handleSignOut = async () => {
    setSignOutError(false);
    try {
      await signOut();
    } catch {
      setSignOutError(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.brand}>SECUREPLAN</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Link href="/agenda" style={styles.agendaLink}>
          Abrir agenda
        </Link>
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
        {signOutError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            No se pudo cerrar la sesión. Inténtalo de nuevo.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  brand: { color: '#28715E', fontSize: 12, fontWeight: '700' },
  title: { marginTop: 20, color: '#172D27', fontSize: 32, fontWeight: '700' },
  agendaLink: {
    marginTop: 32,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#28715E',
    fontSize: 17,
    fontWeight: '600',
  },
  signOutButton: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingVertical: 12,
  },
  signOutText: { color: '#53665F', fontSize: 15 },
  error: { marginTop: 12, color: '#A33232', fontSize: 14 },
});