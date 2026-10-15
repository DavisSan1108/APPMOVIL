import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthFormLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer: ReactNode;
}>;

export function AuthFormLayout({
  children,
  title,
  subtitle,
  footer,
}: AuthFormLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.brand}>SECUREPLAN</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.fields}>{children}</View>
            <View style={styles.footer}>{footer}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F4F7F5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', padding: 24 },
  brand: { color: '#28715E', fontSize: 12, fontWeight: '700' },
  title: { marginTop: 20, color: '#172D27', fontSize: 30, fontWeight: '700' },
  subtitle: { marginTop: 8, color: '#63746E', fontSize: 15, lineHeight: 22 },
  fields: { gap: 16, marginTop: 28 },
  footer: { alignItems: 'center', marginTop: 24 },
});