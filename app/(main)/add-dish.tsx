import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  Alert, ActivityIndicator, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useForm } from '@tanstack/react-form';
import { useDishes } from '@/src/hooks/useDishes';
import { useAuth } from '@/src/hooks/useAuth';
import { getCurrentLocation } from '@/src/hooks/useLocation';
import { takePhoto, pickImage } from '@/src/hooks/useMedia';
import { WebView } from 'react-native-webview';
import { uploadDishPhoto } from '@/src/services/storage';

function buildSelectionMapHtml(selectedLat?: number, selectedLng?: number): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const map = L.map('map').setView([-0.1807, -78.4678], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '\u00a9 OpenStreetMap contributors'
      }).addTo(map);

      let marker = null;
      ${selectedLat !== undefined && selectedLng !== undefined ? `
      marker = L.marker([${selectedLat}, ${selectedLng}]).addTo(map);
      ` : ''}

      map.on('click', function(e) {
        if (marker) map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        window.ReactNativeWebView.postMessage(JSON.stringify({lat: e.latlng.lat, lng: e.latlng.lng}));
      });
    </script>
  </body>
  </html>
  `;
}

export default function AddDish() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { addDish, isPending } = useDishes();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [manualCoords, setManualCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const webViewRef = useRef<WebView>(null);

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
      if (!userId) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      setCapturing(true);
      try {
        // 1. Subir foto a Supabase Storage y obtener URL pública permanente
        const publicUrl = await uploadDishPhoto(photoUri, userId);

        // 2. Obtener ubicación según el modo seleccionado
        let latitude: number;
        let longitude: number;
        let city: string | null = null;
        let country: string | null = null;

        if (locationMode === 'auto') {
          const location = await getCurrentLocation();
          latitude = location.latitude;
          longitude = location.longitude;
          city = location.city ?? null;
          country = location.country ?? null;
        } else {
          if (!manualCoords) {
            Alert.alert('Error', 'Debes seleccionar una ubicación en el mapa');
            setCapturing(false);
            return;
          }
          latitude = manualCoords.latitude;
          longitude = manualCoords.longitude;
        }

        // 3. Guardar plato con la URL pública (no la ruta local)
        await addDish({
          name: value.name,
          photo_uri: publicUrl,
          latitude,
          longitude,
          city,
          country,
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
    <SafeAreaView edges={['top']} style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Registrar Plato</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
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
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Nombre del plato *</Text>
                <TextInput
                  style={styles.input}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Ej: Pizza Pepperoni"
                  placeholderTextColor="#9ca3af"
                />
                {field.state.meta.errors?.length ? (
                  <Text style={styles.errorText}>{field.state.meta.errors.join(', ')}</Text>
                ) : null}
              </View>
            )}
          </form.Field>

          {/* Sección foto */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Foto *</Text>

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Sin foto seleccionada</Text>
              </View>
            )}

            <View style={styles.photoButtons}>
              <Pressable
                style={[styles.photoBtn, styles.photoBtnRed]}
                onPress={handleTakePhoto}
                disabled={isSubmitting}
              >
                <Text style={styles.photoBtnText}>📷 Cámara</Text>
              </Pressable>
              <Pressable
                style={[styles.photoBtn, styles.photoBtnBlue]}
                onPress={handlePickImage}
                disabled={isSubmitting}
              >
                <Text style={styles.photoBtnText}>🖼️ Galería</Text>
              </Pressable>
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Ubicación *</Text>
            <View style={styles.locationButtons}>
              <Pressable
                style={[
                  styles.locationBtn,
                  locationMode === 'auto' ? styles.locationBtnActive : styles.locationBtnInactive,
                ]}
                onPress={() => setLocationMode('auto')}
              >
                <Text style={[
                  styles.locationBtnText,
                  locationMode === 'auto' ? styles.locationBtnTextActive : styles.locationBtnTextInactive,
                ]}>📍 Ubicación actual</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.locationBtn,
                  locationMode === 'manual' ? styles.locationBtnActive : styles.locationBtnInactive,
                ]}
                onPress={() => setLocationMode('manual')}
              >
                <Text style={[
                  styles.locationBtnText,
                  locationMode === 'manual' ? styles.locationBtnTextActive : styles.locationBtnTextInactive,
                ]}>🗺️ Seleccionar en mapa</Text>
              </Pressable>
            </View>

            {locationMode === 'manual' && (
              <WebView
                ref={webViewRef}
                style={styles.map}
                source={{ html: buildSelectionMapHtml(manualCoords?.latitude, manualCoords?.longitude) }}
                originWhitelist={['*']}
                javaScriptEnabled
                onMessage={(e) => {
                  const { lat, lng } = JSON.parse(e.nativeEvent.data);
                  setManualCoords({ latitude: lat, longitude: lng });
                }}
              />
            )}
          </View>

          {/* Botón Registrar con withSpring */}
          <Animated.View style={[styles.submitWrapper, animatedStyle]}>
            <Pressable
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={form.handleSubmit}
              onPressIn={() => { scale.value = withSpring(0.96); }}
              onPressOut={() => { scale.value = withSpring(1); }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Registrar Plato</Text>
              )}
            </Pressable>
          </Animated.View>

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0055A5' },
  header: {
    backgroundColor: '#0055A5',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 80 },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 80 },
  content: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 13, color: '#0055A5', fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  errorText: { color: '#ef4444', fontSize: 11, marginTop: 3 },
  photoPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  photoPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  photoPlaceholderIcon: { fontSize: 36 },
  photoPlaceholderText: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  photoButtons: { flexDirection: 'row', gap: 10 },
  photoBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  photoBtnRed: { backgroundColor: '#E31837' },
  photoBtnBlue: { backgroundColor: '#0055A5' },
  photoBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  submitWrapper: { marginTop: 8 },
  submitBtn: {
    backgroundColor: '#E31837',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9ca3af' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  locationButtons: { flexDirection: 'row', gap: 10 },
  locationBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationBtnActive: { backgroundColor: '#0055A5', borderColor: '#003d7a' },
  locationBtnInactive: { backgroundColor: '#6b7280' },
  locationBtnText: { fontWeight: '700', fontSize: 13 },
  locationBtnTextActive: { color: '#fff' },
  locationBtnTextInactive: { color: '#fff' },
  map: { height: 220, borderRadius: 12, marginTop: 8 },
});