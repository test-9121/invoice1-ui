// Client Types

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  secondaryEmail?: string;
  mobile: string;
  secondaryMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  
  // Billing Address (flat structure)
  billingAddressLine1: string;
  billingAddressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Shipping Address (flat structure)
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  
  // Contact Person (flat structure)
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  
  notes?: string;
  isActive: boolean;
  
  // Computed fields (from backend)
  totalInvoices?: number;
  pendingInvoices?: number;
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface ClientsResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClientStatistics {
  totalInvoices: number;
  pendingInvoices: number;
  completedInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageInvoiceAmount: number;
  lastInvoiceDate: string;
  firstInvoiceDate: string;
}

export interface CreateClientRequest {
  name: string;
  company: string;
  email: string;
  secondaryEmail?: string;
  mobile: string;
  secondaryMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  
  // Billing Address
  billingAddressLine1: string;
  billingAddressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Shipping Address
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  
  // Contact Person
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  
  notes?: string;
  isActive?: boolean;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}

export interface ClientFilters {
  search?: string;
  // status filter uses backend status values: 'ACTIVE' | 'INACTIVE'
  status?: 'ACTIVE' | 'INACTIVE';
  hasPending?: boolean;
  states?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'company' | 'createdAt' | 'totalInvoices';
  sortOrder?: 'asc' | 'desc';
}
