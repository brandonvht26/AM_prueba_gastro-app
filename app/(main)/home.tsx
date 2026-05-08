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
  const { dishes, isLoading, refetch, deleteDish } = useDishes();
  const [refreshing, setRefreshing] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.9); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <DishCard dish={item} onDelete={deleteDish} />
  );

  return (
    // SafeAreaView solo maneja el área del notch (top), con el color del header
    <SafeAreaView edges={['top']} className="flex-1 bg-dominos-blue">

      {/* Header */}
      <View className="bg-dominos-blue px-6 pt-2 pb-4 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">
          Mis Platos 🍕
        </Text>
        <Pressable
          onPress={signOut}
          className="bg-dominos-red rounded-lg px-3 py-1.5"
        >
          <Text className="text-white text-sm font-semibold">
            Cerrar Sesión
          </Text>
        </Pressable>
      </View>

      {/* Contenido — fondo blanco, posición relativa para el FAB */}
      <View className="flex-1 bg-dominos-white">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#E31837" />
          </View>
        ) : !dishes || dishes.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-gray-600 text-lg font-semibold text-center">
              Sin platos registrados
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
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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

        {/* FAB — absolute dentro del View blanco */}
        <Animated.View
          style={[
            animatedStyle,
            { position: 'absolute', bottom: 32, right: 32 },
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(main)/add-dish')}
            className="bg-dominos-red w-16 h-16 rounded-full items-center justify-center"
            style={{ elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 }}
          >
            <Text className="text-white text-3xl font-bold leading-none">
              +
            </Text>
          </Pressable>
        </Animated.View>
      </View>

    </SafeAreaView>
  );
}