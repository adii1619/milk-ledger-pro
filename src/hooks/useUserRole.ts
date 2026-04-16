import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'user' | 'milkman' | 'dairy_shop_owner';

export function useUserRole() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.role as AppRole | null;
    },
    enabled: !!user,
  });

  const setRole = useMutation({
    mutationFn: async (role: AppRole) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user!.id, role });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-role'] }),
  });

  return {
    role: query.data ?? null,
    isLoading: query.isLoading,
    setRole: setRole.mutateAsync,
  };
}
