import { Stack } from 'expo-router';

export default function MainAppLayout() {
  return (
    <Stack initialRouteName="agenda" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="agenda" />
      <Stack.Screen name="index" />
    </Stack>
  );
}