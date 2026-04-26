import useSWR from 'swr';
import apiClient from '@/lib/api';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export function useAppointments() {
  const { data, error, mutate } = useSWR('/appointments', fetcher, {
    refreshInterval: 3000, // Poll every 3 seconds for "real-time" sync
  });

  return {
    appointments: data?.appointments || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
