// Custom hook for client operations

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { clientService } from '@/services/client.service';
import type { Client, ClientFilters, CreateClientRequest, UpdateClientRequest } from '@/types/client';

export const useClients = (initialFilters?: ClientFilters) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<ClientFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: 'name',
    // sortOrder: 'asc',
  });

  const { toast } = useToast();
  const isFetchingRef = useRef(false);

  const fetchClients = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('[useClients] Fetch already in progress, skipping');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      console.log('[useClients] Fetching clients with filters:', filters);
      const response = await clientService.getClients(filters);
      console.log('[useClients] Response received:', response);
      
      if (response.success && response.data) {
        setClients(response.data.clients);
        setPagination(response.data.pagination);
        console.log('[useClients] Clients loaded:', response.data.clients.length);
      } else {
        console.error('[useClients] Response not successful:', response);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      console.error('[useClients] Error fetching clients:', err);
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const createClient = async (data: CreateClientRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await clientService.createClient(data);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Client created successfully',
        });
        await fetchClients(); // Refresh list
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create client';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClient = async (clientId: string, data: Partial<UpdateClientRequest>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await clientService.updateClient(clientId, data);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
        await fetchClients(); // Refresh list
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClient = async (clientId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await clientService.deleteClient(clientId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Client deleted successfully',
        });
        await fetchClients(); // Refresh list
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    console.log('[useClients] Updating filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }, []);

  useEffect(() => {
    console.log('[useClients] useEffect triggered, filters changed:', filters);
    // Add a small delay to debounce rapid filter changes
    const timeoutId = setTimeout(() => {
      console.log('[useClients] Timeout completed, calling fetchClients');
      fetchClients();
    }, 50);

    return () => {
      console.log('[useClients] Cleanup: clearing timeout');
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    clients,
    isLoading,
    error,
    pagination,
    filters,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    updateFilters,
    resetFilters,
  };
};
