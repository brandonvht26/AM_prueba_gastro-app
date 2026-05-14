import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function buildMapHtml(dishLat: number, dishLng: number, userLat?: number, userLng?: number): string {
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
      const map = L.map('map').setView([${dishLat}, ${dishLng}], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '\u00a9 OpenStreetMap contributors'
      }).addTo(map);

      const dishIcon = L.divIcon({
        html: '<div style="background:#E31837;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>',
        iconSize: [22, 22], iconAnchor: [11, 11], className: ''
      });
      L.marker([${dishLat}, ${dishLng}], {icon: dishIcon})
        .addTo(map)
        .bindPopup('<b>${'${name}'}</b>').openPopup();

      ${userLat !== undefined && userLng !== undefined ? `
      const userIcon = L.divIcon({
        html: '<div style="background:#0055A5;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>',
        iconSize: [22, 22], iconAnchor: [11, 11], className: ''
      });
      L.marker([${userLat}, ${userLng}], {icon: userIcon})
        .addTo(map)
        .bindPopup('Tu ubicaci\u00f3n');
      L.polyline([[${dishLat}, ${dishLng}], [${userLat}, ${userLng}]], {
        color: '#E31837', weight: 3, dashArray: '6,6'
      }).addTo(map);
      ` : ''}
    </script>
  </body>
  </html>
  `;
}

export default function DishDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string; latitude: string; longitude: string }>();
  const latitude = parseFloat(params.latitude);
  const longitude = parseFloat(params.longitude);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    })();
  }, []);

  const distance = userLocation ? haversineKm(userLocation.latitude, userLocation.longitude, latitude, longitude) : null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{params.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <WebView
          source={{ html: buildMapHtml(latitude, longitude, userLocation?.latitude, userLocation?.longitude) }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled
        />
      </View>

      <View style={styles.bottomPanel}>
        {distance !== null ? (
          <Text style={styles.distanceText}>
            📍 Distancia: {distance.toFixed(2)} km desde tu ubicación
          </Text>
        ) : (
          <Text style={styles.distanceText}>📍 Obteniendo ubicación...</Text>
        )}
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
  bottomPanel: {
    height: 90,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
  },
  distanceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0055A5',
    textAlign: 'center',
  },
});
