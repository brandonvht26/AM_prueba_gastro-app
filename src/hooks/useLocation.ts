import * as Location from 'expo-location';

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permiso de ubicación denegado');
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;

  const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

  return {
    latitude,
    longitude,
    city: address?.city ?? null,
    country: address?.country ?? null,
  };
}
