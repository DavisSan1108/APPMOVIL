import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type AuthSubmitButtonProps = {
  label: string;
  loading: boolean;
  onPress: () => void;
};

export function AuthSubmitButton({ label, loading, onPress }: AuthSubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: '#28715E',
  },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.65 },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});