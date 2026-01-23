// User Service - API calls for user management

import { apiClient } from '@/lib/api-client';
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListParams, 
  UserListResponse 
} from '@/types/user';

export class UserService {
  private basePath = '/api/v1/users';

  /**
   * Get paginated list of users with filters
   */
  async getUsers(params?: UserListParams): Promise<UserListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.accountStatus) queryParams.append('accountStatus', params.accountStatus);

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<UserListResponse>(url, true);
      
      return response;
    } catch (error: any) {
      console.error('[UserService] Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User; message: string }>(`${this.basePath}/${id}`, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: User; message: string }>(this.basePath, data, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; data: User; message: string }>(`${this.basePath}/${id}`, data, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string, accountStatus: string): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; data: User; message: string }>(`${this.basePath}/${id}`, { accountStatus }, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error toggling user status:', error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[]; message: string }>(`${this.basePath}/${userId}/roles`, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error fetching user roles:', error);
      throw error;
    }
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any; message: string }>(
        `${this.basePath}/${userId}/roles/bulk`,
        roleIds,
        true
      );
      return response;
    } catch (error: any) {
      console.error('[UserService] Error assigning roles to user:', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; data: any; message: string }>(
        `${this.basePath}/${userId}/roles/${roleId}`,
        true
      );
      return response;
    } catch (error: any) {
      console.error('[UserService] Error removing role from user:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ success: boolean; data: User; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User; message: string }>(`${this.basePath}/me`, true);
      return response;
    } catch (error: any) {
      console.error('[UserService] Error fetching current user:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
