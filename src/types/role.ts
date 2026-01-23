// Role and Permission Types

export interface Permission {
  id: string;
  name?: string; // Legacy field, might not be present
  module: string;
  action: string;
  description: string;
  permissionString: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleListParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface PermissionListParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
}

export interface RoleListResponse {
  success: boolean;
  message?: string;
  data: Role[] | {
    content: Role[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
  timestamp: string;
}

export interface PermissionListResponse {
  success: boolean;
  message?: string;
  data: Permission[] | {
    content: Permission[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
  timestamp: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}
