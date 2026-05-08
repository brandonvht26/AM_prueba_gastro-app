import * as ImagePicker from 'expo-image-picker';

export async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permiso de cámara denegado');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled || !result.assets) {
    return null;
  }

  return result.assets[0].uri;
}

export async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permiso de galería denegado');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled || !result.assets) {
    return null;
  }

  return result.assets[0].uri;
}
