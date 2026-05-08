import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Alert,
  ImageBackground, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '@/src/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      const { error } = await signUp(value.email, value.password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar tu cuenta.');
      }
    },
  });

  return (
    <ImageBackground
      source={require('@/assets/images/wallpaper_register.jpg')}
      style={styles.bg}
      blurRadius={6}
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍕</Text>
            <Text style={styles.logoTitle}>Gastro Map</Text>
            <Text style={styles.logoSubtitle}>Crea tu cuenta y empieza a explorar</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El correo es requerido';
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo inválido';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="tu@correo.com"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  {field.state.meta.errors?.length ? (
                    <Text style={styles.errorText}>{field.state.meta.errors.join(', ')}</Text>
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
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      secureTextEntry={!showPassword}
                      placeholder="••••••"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                      <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {field.state.meta.errors?.length ? (
                    <Text style={styles.errorText}>{field.state.meta.errors.join(', ')}</Text>
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
                <View style={[styles.fieldContainer, { marginBottom: 20 }]}>
                  <Text style={styles.label}>Confirmar Contraseña</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      secureTextEntry={!showConfirm}
                      placeholder="••••••"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                    <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                      <Text style={styles.eyeText}>{showConfirm ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {field.state.meta.errors?.length ? (
                    <Text style={styles.errorText}>{field.state.meta.errors.join(', ')}</Text>
                  ) : null}
                </View>
              )}
            </form.Field>

            <Pressable style={styles.button} onPress={form.handleSubmit}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.linkBtn}>
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 55, 120, 0.62)' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginTop: 32, marginBottom: 24 },
  logoEmoji: { fontSize: 48 },
  logoTitle: { fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 8 },
  logoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  cardTitle: { fontSize: 21, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 18 },
  fieldContainer: { marginBottom: 14 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#fff',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
  },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#fff' },
  eyeBtn: { paddingHorizontal: 12 },
  eyeText: { fontSize: 17 },
  button: { backgroundColor: '#E31837', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#fca5a5', fontSize: 11, marginTop: 3 },
  linkBtn: { alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.88)', fontSize: 13 },
});
