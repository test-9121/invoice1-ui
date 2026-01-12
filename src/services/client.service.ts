// Client Service - API Integration

import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/auth';
import type {
  Client,
  ClientsResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientFilters,
  ClientStatistics,
  ClientStatus,
} from '@/types/client';

const CLIENT_BASE_PATH = '/api/v1/clients';

export class ClientService {
  /**
   * Get all clients with pagination and filters
   */
  async getClients(filters?: ClientFilters): Promise<ApiResponse<ClientsResponse>> {
    const params = new URLSearchParams();
    
    // Search / basic filters
    if (filters?.search) params.append('search', filters.search);
    if (filters?.hasPending !== undefined) params.append('hasPending', filters.hasPending.toString());
    if (filters?.status !== undefined) {
      // send status as backend expects (e.g., ACTIVE/INACTIVE).
      params.append('status', String(filters.status));
    }
    if (filters?.states?.length) params.append('states', filters.states.join(','));

    // Pagination: frontend uses `page` (1-based) and `limit`; backend expects `page` (0-based) and `size`.
    if (typeof filters?.page === 'number') {
      // convert to 0-based page for backend
      const backendPage = Math.max(0, filters.page - 1);
      params.append('page', backendPage.toString());
    }
    if (typeof filters?.limit === 'number') {
      params.append('limit', filters.limit.toString());
      // also include `size` for backend compatibility
      params.append('size', filters.limit.toString());
    }

    // Sorting: frontend uses `sortBy` and `sortOrder` ('asc'|'desc'); backend expects `sortBy` and `sortDir` (ASC|DESC)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortDir', (filters.sortOrder || 'asc').toUpperCase());

    const queryString = params.toString();
    const endpoint = queryString ? `${CLIENT_BASE_PATH}?${queryString}` : CLIENT_BASE_PATH;

    console.log('[ClientService] Calling GET:', endpoint);

    // Call backend and transform pageable response into frontend-friendly shape
    const raw = await apiClient.get<any>(endpoint, true);

    if (!raw) {
      return raw;
    }

    try {
      if (raw.success && raw.data) {
        const backend = raw.data;
        const content = Array.isArray(backend.content) ? backend.content : [];

        const mapped: ClientsResponse = {
          clients: content,
          pagination: {
            total: typeof backend.totalElements === 'number' ? backend.totalElements : (content.length || 0),
            page: typeof backend.number === 'number' ? backend.number + 1 : 1, // convert 0-based -> 1-based
            limit: typeof backend.size === 'number' ? backend.size : (content.length || 10),
            totalPages: typeof backend.totalPages === 'number' ? backend.totalPages : 1,
            hasNext: !!backend && !!backend.last ? false : true,
            hasPrev: !!backend && !!backend.first ? false : true,
          },
        };

        console.log('[ClientService] Mapped backend response to ClientsResponse:', mapped.pagination);

        // Return a shape compatible with ApiResponse<ClientsResponse>
        return {
          ...raw,
          data: mapped,
        } as ApiResponse<ClientsResponse>;
      }

      return raw as ApiResponse<ClientsResponse>;
    } catch (err) {
      console.error('[ClientService] Error mapping backend response:', err);
      return raw as ApiResponse<ClientsResponse>;
    }
  }

  /**
   * Get client by ID
   */
  async getClientById(clientId: string): Promise<ApiResponse<Client>> {
    return apiClient.get<ApiResponse<Client>>(
      `${CLIENT_BASE_PATH}/${clientId}`,
      true
    );
  }

  /**
   * Create new client
   */
  async createClient(data: CreateClientRequest): Promise<ApiResponse<Client>> {
    return apiClient.post<ApiResponse<Client>>(
      CLIENT_BASE_PATH,
      data,
      true
    );
  }

  /**
   * Update existing client
   */
  async updateClient(clientId: string, data: Partial<UpdateClientRequest>): Promise<ApiResponse<Client>> {
    return apiClient.put<ApiResponse<Client>>(
      `${CLIENT_BASE_PATH}/${clientId}`,
      data,
      true
    );
  }

  /**
   * Delete client
   */
  async deleteClient(clientId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `${CLIENT_BASE_PATH}/${clientId}`,
      true
    );
  }

  /**
   * Get client statistics
   */
  async getClientStatistics(clientId: string): Promise<ApiResponse<ClientStatistics>> {
    return apiClient.get<ApiResponse<ClientStatistics>>(
      `${CLIENT_BASE_PATH}/${clientId}/statistics`,
      true
    );
  }

  /**
   * Update client status
   */
  async updateClientStatus(clientId: string, status: ClientStatus): Promise<ApiResponse<Client>> {
    return apiClient.post<ApiResponse<Client>>(
      `${CLIENT_BASE_PATH}/${clientId}/status`,
      { status },
      true
    );
  }

  /**
   * Search clients with advanced filters
   */
  async searchClients(filters: ClientFilters): Promise<ApiResponse<ClientsResponse>> {
    return apiClient.post<ApiResponse<ClientsResponse>>(
      `${CLIENT_BASE_PATH}/search`,
      filters,
      true
    );
  }

  /**
   * Bulk import clients
   */
  async bulkImportClients(clients: CreateClientRequest[]): Promise<ApiResponse<{
    imported: number;
    failed: number;
    errors: any[];
    clients: Client[];
  }>> {
    return apiClient.post<ApiResponse<{
      imported: number;
      failed: number;
      errors: any[];
      clients: Client[];
    }>>(
      `${CLIENT_BASE_PATH}/bulk-import`,
      { clients },
      true
    );
  }

  /**
   * Export clients
   */
  async exportClients(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(
      `${apiClient['baseURL'] || 'http://localhost:8080'}${CLIENT_BASE_PATH}/export?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const clientService = new ClientService();
