import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useForm } from '@tanstack/react-form';
import { useDishes } from '@/src/hooks/useDishes';
import { getCurrentLocation } from '@/src/hooks/useLocation';
import { takePhoto, pickImage } from '@/src/hooks/useMedia';

export default function AddDish() {
  const router = useRouter();
  const { addDish, isPending } = useDishes();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Animación withSpring para el botón Registrar
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      if (!photoUri) {
        Alert.alert('Error', 'Debes tomar o seleccionar una foto');
        return;
      }
      setCapturing(true);
      try {
        const location = await getCurrentLocation();
        await addDish({
          name: value.name,
          photo_uri: photoUri,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        });
        Alert.alert('Éxito', 'Plato registrado correctamente', [
          { text: 'OK', onPress: () => router.replace('/(main)/home') },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err?.message ?? 'Ocurrió un error');
      } finally {
        setCapturing(false);
      }
    },
  });

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) setPhotoUri(uri);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo tomar la foto');
    }
  };

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) setPhotoUri(uri);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo seleccionar la imagen');
    }
  };

  const isSubmitting = isPending || capturing;

  return (
    // SafeAreaView solo top, azul para que el notch sea del color del header
    <SafeAreaView edges={['top']} className="flex-1 bg-dominos-blue">

      {/* Header */}
      <View className="bg-dominos-blue px-6 pt-2 pb-4 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-white font-semibold text-base">← Volver</Text>
        </Pressable>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-12">
          Registrar Plato
        </Text>
      </View>

      {/* Contenido con ScrollView */}
      <View className="flex-1 bg-dominos-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Campo nombre */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'El nombre es requerido';
                return undefined;
              },
            }}
          >
            {(field) => (
              <View className="mb-5">
                <Text className="text-sm text-dominos-blue font-semibold mb-1">
                  Nombre del plato *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Ej: Pizza Pepperoni"
                  placeholderTextColor="#9ca3af"
                />
                {field.state.meta.errors ? (
                  <Text className="text-red-500 text-xs mt-1">
                    {field.state.meta.errors.join(', ')}
                  </Text>
                ) : null}
              </View>
            )}
          </form.Field>

          {/* Sección foto */}
          <View className="mb-5">
            <Text className="text-sm text-dominos-blue font-semibold mb-2">
              Foto *
            </Text>

            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                className="w-full h-52 rounded-xl mb-3"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-full h-40 rounded-xl mb-3 items-center justify-center border-2 border-dashed border-gray-300"
              >
                <Text className="text-4xl">📷</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Sin foto seleccionada
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-dominos-red rounded-xl py-3 items-center"
                onPress={handleTakePhoto}
                disabled={isSubmitting}
              >
                <Text className="text-white font-bold text-sm">📷 Cámara</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-dominos-blue rounded-xl py-3 items-center"
                onPress={handlePickImage}
                disabled={isSubmitting}
              >
                <Text className="text-white font-bold text-sm">🖼️ Galería</Text>
              </Pressable>
            </View>
          </View>

          {/* Botón Registrar con withSpring */}
          <Animated.View style={animatedStyle} className="mt-2">
            <Pressable
              className={`rounded-xl py-4 items-center ${isSubmitting ? 'bg-gray-400' : 'bg-dominos-red'}`}
              onPress={form.handleSubmit}
              onPressIn={() => { scale.value = withSpring(0.96); }}
              onPressOut={() => { scale.value = withSpring(1); }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Registrar Plato
                </Text>
              )}
            </Pressable>
          </Animated.View>

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}