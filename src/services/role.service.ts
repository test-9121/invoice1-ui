// Role Service - API calls for role management

import { apiClient } from '@/lib/api-client';
import type { 
  Role, 
  Permission,
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RoleListParams,
  PermissionListParams,
  RoleListResponse,
  PermissionListResponse
} from '@/types/role';

export class RoleService {
  private basePath = '/api/v1/roles';
  private permissionBasePath = '/api/v1/permissions';

  /**
   * Get paginated list of roles
   */
  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<RoleListResponse>(url, true);
      
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<{ success: boolean; data: Role; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Role; message: string }>(`${this.basePath}/${id}`, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<{ success: boolean; data: Role; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Role; message: string }>(this.basePath, data, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update existing role
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<{ success: boolean; data: Role; message: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Role; message: string }>(`${this.basePath}/${id}`, data, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Get paginated list of permissions
   */
  async getPermissions(params?: PermissionListParams): Promise<PermissionListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);

      const url = `${this.permissionBasePath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<PermissionListResponse>(url, true);
      
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Get all permissions (without pagination) for role assignment
   */
  async getAllPermissions(): Promise<{ success: boolean; data: Permission[]; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Permission[]; message: string }>(`${this.permissionBasePath}/all`, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error fetching all permissions:', error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string): Promise<{ success: boolean; data: Permission[]; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Permission[]; message: string }>(`${this.basePath}/${roleId}/permissions`, true);
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error fetching role permissions:', error);
      throw error;
    }
  }


  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any; message: string }>(
        `${this.basePath}/${roleId}/permissions/bulk`,
        permissionIds,
        true
      );
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error adding permissions to role:', error);
      throw error;
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; data: any; message: string }>(
        `${this.basePath}/${roleId}/permissions/${permissionId}`,
        true
      );
      return response;
    } catch (error: any) {
      console.error('[RoleService] Error removing permission from role:', error);
      throw error;
    }
  }
}


export const roleService = new RoleService();
