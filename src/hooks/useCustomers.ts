import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomers, addCustomer, deleteCustomer, updateCustomerAutoReceipt, Customer } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function useCustomers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: () => getCustomers(user!.id),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'autoMonthlyReceipt'>) =>
      addCustomer(user!.id, customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const toggleAutoReceipt = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateCustomerAutoReceipt(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return {
    customers: query.data || [],
    isLoading: query.isLoading,
    addCustomer: addMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    toggleAutoReceipt: toggleAutoReceipt.mutateAsync,
  };
}
