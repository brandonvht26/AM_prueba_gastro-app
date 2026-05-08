import { useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useAuth } from '@/src/hooks/useAuth';
import { useDishes } from '@/src/hooks/useDishes';
import DishCard from '@/src/components/DishCard';
import type { Dish } from '@/src/types';

export default function Home() {
  const router = useRouter();
  const { signOut } = useAuth();
  const scale = useSharedValue(1);
  const { dishes, isLoading, refetch, isRefetching, deleteDish } = useDishes();
  const [refreshing, setRefreshing] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <DishCard dish={item} onDelete={deleteDish} />
  );

  return (
    <SafeAreaView className="flex-1 bg-dominos-white relative">
      <View className="bg-dominos-blue pb-4 px-6 flex-row items-center justify-between">
        <Text className="text-dominos-white text-2xl font-bold">
          Mis Platos
        </Text>
        <Pressable onPress={signOut}>
          <Text className="text-dominos-white text-sm font-semibold">
            Cerrar Sesión
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E31837" />
        </View>
      ) : !dishes || dishes.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-gray-500 text-lg text-center">
            Aún no has registrado ningún plato.
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Presiona el botón + para agregar tu primer plato.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerClassName="p-4 pb-24"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E31837"
              colors={['#E31837']}
            />
          }
        />
      )}

      <Animated.View
        className="absolute bottom-8 right-8"
        style={animatedStyle}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push('/(main)/add-dish')}
          className="bg-dominos-red w-16 h-16 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-dominos-white text-3xl font-bold leading-none">
            +
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
