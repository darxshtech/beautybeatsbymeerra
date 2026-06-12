import useSWR from 'swr';
import apiClient from '@/lib/api';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export function useServices() {
  const { data, error } = useSWR('/services', fetcher);

  return {
    services: data?.services || [],
    isLoading: !error && !data,
    isError: error
  };
}
