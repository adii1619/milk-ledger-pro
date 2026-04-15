import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getEntries, addEntry, deleteEntry, MilkEntry } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function useEntries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['entries', user?.id],
    queryFn: () => getEntries(user!.id),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (entry: Omit<MilkEntry, 'id' | 'total'>) =>
      addEntry(user!.id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return {
    entries: query.data || [],
    isLoading: query.isLoading,
    addEntry: addMutation.mutateAsync,
  };
}
