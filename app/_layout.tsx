import 'react-native-gesture-handler';
import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/src/hooks/useAuth';

const queryClient = new QueryClient();

function RootLayout() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Si sigue cargando la sesión inicial de Supabase, no hacemos nada aún
    if (isLoading) return;

    // Verificamos en qué grupo de rutas está el usuario actualmente
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Si no hay sesión y trata de entrar a la app, lo mandamos al login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Si ya hay sesión y trata de ver el login/register, lo mandamos al home
      router.replace('/(main)/home');
    }
  }, [session, isLoading, segments]);

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View className="absolute inset-0 z-50 justify-center items-center bg-dominos-white">
          <ActivityIndicator size="large" color="#E31837" />
        </View>
      )}
      {/* El Stack SIEMPRE debe renderizarse */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout />
    </QueryClientProvider>
  );
}