// User Types

export type UserRole = 'ADMIN' | 'USER' | 'SUPER_ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'GITHUB';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  accountStatus: AccountStatus;
  authProvider: AuthProvider;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  roles: Role[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  accountStatus?: AccountStatus;
  password?: string;
  roles?: string[];
}

export interface UserListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  role?: string;
  accountStatus?: AccountStatus;
}

export interface UserListResponse {
  success: boolean;
  message?: string;
  data: {
    content: User[];
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
