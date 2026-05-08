import { View, Text, TextInput, Pressable, Alert, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '@/src/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      const { error } = await signUp(value.email, value.password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Cuenta creada',
          'Revisa tu correo para confirmar tu cuenta.'
        );
      }
    },
  });

  return (
    <ImageBackground
      source={require('@/assets/images/wallpaper_register.jpg')}
      className="flex-1"
      blurRadius={10}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 55, 120, 0.60)' }}>
        <SafeAreaView className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-10"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo / Título */}
            <View className="items-center mt-10 mb-8">
              <Text className="text-5xl font-bold text-white">
                🍕
              </Text>
              <Text className="text-4xl font-bold text-white mt-2">
                Gastro Map
              </Text>
              <Text className="text-white text-sm mt-1 opacity-80">
                Crea tu cuenta y empieza a explorar
              </Text>
            </View>

            {/* Card del formulario */}
            <View
              className="rounded-2xl px-6 pt-8 pb-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <Text className="text-2xl font-bold text-white text-center mb-6">
                Crear Cuenta
              </Text>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'El correo es requerido';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return 'Correo inválido';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm text-white mb-1 font-medium opacity-90">
                      Email
                    </Text>
                    <TextInput
                      className="rounded-xl px-4 py-3 text-base text-white"
                      style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="tu@correo.com"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    {field.state.meta.errors ? (
                      <Text className="text-red-300 text-xs mt-1">
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    ) : null}
                  </View>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'La contraseña es requerida';
                    if (value.length < 6) return 'Mínimo 6 caracteres';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <View className="mb-4">
                    <Text className="text-sm text-white mb-1 font-medium opacity-90">
                      Contraseña
                    </Text>
                    <TextInput
                      className="rounded-xl px-4 py-3 text-base text-white"
                      style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      secureTextEntry
                      placeholder="••••••"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    {field.state.meta.errors ? (
                      <Text className="text-red-300 text-xs mt-1">
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    ) : null}
                  </View>
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return 'Confirma tu contraseña';
                    const password = fieldApi.form.getFieldValue('password');
                    if (value !== password) return 'Las contraseñas no coinciden';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <View className="mb-6">
                    <Text className="text-sm text-white mb-1 font-medium opacity-90">
                      Confirmar Contraseña
                    </Text>
                    <TextInput
                      className="rounded-xl px-4 py-3 text-base text-white"
                      style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      secureTextEntry
                      placeholder="••••••"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    {field.state.meta.errors ? (
                      <Text className="text-red-300 text-xs mt-1">
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    ) : null}
                  </View>
                )}
              </form.Field>

              <Pressable
                className="bg-dominos-red rounded-xl py-4 items-center mb-4"
                onPress={form.handleSubmit}
              >
                <Text className="text-white font-bold text-base">
                  Registrarse
                </Text>
              </Pressable>

              <Pressable
                className="items-center"
                onPress={() => router.push('/(auth)/login')}
              >
                <Text className="text-white text-sm opacity-90">
                  ¿Ya tienes cuenta? Inicia sesión
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}