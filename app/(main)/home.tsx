import { useState } from 'react';
import {
  View, Text, Pressable, FlatList,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <DishCard
      dish={item}
      onDelete={deleteDish}
      onViewMap={(dish) => router.push({
        pathname: '/(main)/dish-detail',
        params: {
          id: dish.id,
          name: dish.name,
          latitude: String(dish.latitude),
          longitude: String(dish.longitude),
        },
      })}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Platos 🍕</Text>
        <Pressable style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#E31837" />
          </View>
        ) : !dishes || dishes.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>Sin platos registrados</Text>
            <Text style={styles.emptySubtitle}>
              Presiona el botón + para agregar tu primer plato.
            </Text>
          </View>
        ) : (
          <FlatList
            data={dishes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
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

        {/* FAB */}
        <Animated.View style={[styles.fab, animatedStyle]}>
          <Pressable
            onPressIn={() => { scale.value = withSpring(0.88); }}
            onPressOut={() => { scale.value = withSpring(1); }}
            onPress={() => router.push('/(main)/add-dish')}
            style={styles.fabButton}
          >
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </Animated.View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0055A5' },
  header: {
    backgroundColor: '#0055A5',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  logoutBtn: {
    backgroundColor: '#E31837',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#4b5563', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 6 },
  listContent: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 28, right: 24 },
  fabButton: {
    backgroundColor: '#E31837',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '700', lineHeight: 34 },
});
