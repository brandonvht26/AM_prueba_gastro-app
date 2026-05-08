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

  const mutation = useMutation({
    mutationFn: async (newDish: Omit<Dish, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('dishes')
        .insert(newDish)
        .select()
        .single();

      if (error) throw error;
      return data as Dish;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', userId] });
    },
  });

  return { dishes: query.data, isLoading: query.isLoading, error: query.error, ...mutation };
}
