import { View, Text, TextInput, Pressable, Alert } from 'react-native';
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
    <SafeAreaView className="flex-1 justify-center px-6 bg-dominos-white">
      <Text className="text-3xl font-bold text-dominos-red text-center mb-8">
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
            <Text className="text-sm text-dominos-blue mb-1">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="tu@correo.com"
            />
            {field.state.meta.errors ? (
              <Text className="text-red-500 text-xs mt-1">
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
            if (value.length < 6)
              return 'Mínimo 6 caracteres';
            return undefined;
          },
        }}
      >
        {(field) => (
          <View className="mb-4">
            <Text className="text-sm text-dominos-blue mb-1">Contraseña</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              secureTextEntry
              placeholder="••••••"
            />
            {field.state.meta.errors ? (
              <Text className="text-red-500 text-xs mt-1">
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
            <Text className="text-sm text-dominos-blue mb-1">
              Confirmar Contraseña
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              secureTextEntry
              placeholder="••••••"
            />
            {field.state.meta.errors ? (
              <Text className="text-red-500 text-xs mt-1">
                {field.state.meta.errors.join(', ')}
              </Text>
            ) : null}
          </View>
        )}
      </form.Field>

      <Pressable
        className="bg-dominos-red rounded-lg py-3.5 items-center mb-4"
        onPress={form.handleSubmit}
      >
        <Text className="text-dominos-white font-bold text-base">
          Registrarse
        </Text>
      </Pressable>

      <Pressable
        className="items-center"
        onPress={() => router.push('/(auth)/login')}
      >
        <Text className="text-dominos-blue text-sm">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
