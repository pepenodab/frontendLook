// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Simplemente redirige a /login
  // Expo Router se encargará de esto una vez que la navegación esté lista.
  return <Redirect href="/login" />;
}