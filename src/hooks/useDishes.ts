import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/services/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import type { Dish } from '@/src/types';

export function useDishes() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: ['dishes', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dish[];
    },
    enabled: !!userId,
  });

  type InsertDish = Omit<Dish, 'id' | 'created_at' | 'user_id'>;

  const mutation = useMutation({
    mutationFn: async (newDish: InsertDish) => {
      if (!userId) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('dishes')
        .insert({
          user_id: userId,
          name: newDish.name,
          photo_uri: newDish.photo_uri,
          city: newDish.city,
          country: newDish.country,
          latitude: newDish.latitude,
          longitude: newDish.longitude,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Dish;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dishes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', userId] });
    },
  });

  return {
    dishes: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    addDish: mutation.mutateAsync,
    isPending: mutation.isPending,
    deleteDish: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
