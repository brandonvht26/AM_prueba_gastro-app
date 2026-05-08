import { useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import type { Dish } from '@/src/types';

interface Props {
  dish: Dish;
  onDelete: (id: string) => Promise<void>;
}

export default function DishCard({ dish, onDelete }: Props) {
  const [removing, setRemoving] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar plato',
      `¿Estás seguro de que deseas eliminar "${dish.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setRemoving(true),
        },
      ]
    );
  };

  if (removing) {
    return (
      <Animated.View exiting={FadeOutLeft.duration(300)} onLayout={() => onDelete(dish.id)}>
        <View />
      </Animated.View>
    );
  }

  const renderRightActions = () => (
    <Pressable
      className="bg-dominos-red justify-center items-center px-6 rounded-lg ml-2"
      onPress={handleDelete}
    >
      <Text className="text-dominos-white font-bold text-sm">Eliminar</Text>
    </Pressable>
  );

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <View className="bg-white rounded-lg mb-3 shadow-sm border border-gray-200 overflow-hidden">
          {dish.photo_uri && (
            <Image
              source={{ uri: dish.photo_uri }}
              className="w-full h-40"
              resizeMode="cover"
            />
          )}
          <View className="px-4 py-3">
            <Text className="text-lg font-bold text-dominos-blue">{dish.name}</Text>
            {dish.city && (
              <Text className="text-sm text-gray-500 mt-1">{dish.city}</Text>
            )}
          </View>
        </View>
      </Swipeable>
    </Animated.View>
  );
}