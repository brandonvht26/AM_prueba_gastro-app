import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from '@tanstack/react-form';
import { useDishes } from '@/src/hooks/useDishes';
import { getCurrentLocation } from '@/src/hooks/useLocation';
import { takePhoto, pickImage } from '@/src/hooks/useMedia';

export default function AddDish() {
  const router = useRouter();
  const { addDish, isPending } = useDishes();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
    },
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
    <SafeAreaView className="flex-1 bg-dominos-white">
      <View className="bg-dominos-blue py-4 px-6 flex-row items-center relative">
        <Pressable onPress={() => router.back()} className="absolute left-6 z-10">
          <Text className="text-dominos-white font-semibold text-sm">
            ← Volver
          </Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-dominos-white text-xl font-bold">
            Registrar Plato
          </Text>
        </View>
      </View>

      <View className="flex-1 px-6 pt-6">
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
            <View className="mb-4">
              <Text className="text-sm text-dominos-blue mb-1">
                Nombre del plato *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Ej: Pizza Pepperoni"
              />
              {field.state.meta.errors ? (
                <Text className="text-red-500 text-xs mt-1">
                  {field.state.meta.errors.join(', ')}
                </Text>
              ) : null}
            </View>
          )}
        </form.Field>

        <View className="mb-4">
          <Text className="text-sm text-dominos-blue mb-2">Foto *</Text>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className="w-full h-48 rounded-lg mb-2"
              resizeMode="cover"
            />
          )}
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-dominos-red rounded-lg py-3 items-center"
              onPress={handleTakePhoto}
              disabled={isSubmitting}
            >
              <Text className="text-dominos-white font-bold text-sm">
                Tomar Foto
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-dominos-blue rounded-lg py-3 items-center"
              onPress={handlePickImage}
              disabled={isSubmitting}
            >
              <Text className="text-dominos-white font-bold text-sm">
                Elegir de Galería
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className={`rounded-lg py-3.5 items-center mb-6 ${isSubmitting ? 'bg-gray-400' : 'bg-dominos-red'}`}
          onPress={form.handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-dominos-white font-bold text-base">
              Registrar
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
