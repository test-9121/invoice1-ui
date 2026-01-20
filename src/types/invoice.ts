// Invoice Types

import type { Client } from './client';
import type { Product } from './product';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number | null;
  amount: number | null;
  description?: string;
  productId?: string;
  productMatches?: Product[] | null;
}

export interface VoiceInvoiceData {
  clientName: string | null;
  client?: Client | null;
  clientMatches?: Client[] | null;
  hasMultipleClientMatches?: boolean;
  issuedDate: string | null;
  dueDate: string | null;
  items: InvoiceItem[];
  discount: number | null;
  taxPercent: number | null;
  notes: string | null;
  subtotalAmount: number;
  totalAmount: number;
}

export interface VoiceInvoiceResponse {
  data: VoiceInvoiceData;
  confidence?: Record<string, number>;
}

export interface InvoiceFormData {
  clientId?: string; // Foreign key to client (UUID)
  clientName: string; // Display name (will be mapped from client)
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  taxPercent: number;
  notes: string;
  subtotalAmount?: number; // Calculated field
  totalAmount?: number; // Calculated field
}

// Invoice List Types
export type InvoiceStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'VIEWED' 
  | 'PARTIALLY_PAID' 
  | 'PAID' 
  | 'OVERDUE' 
  | 'CANCELLED' 
  | 'REFUNDED';

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currencyCode: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  lineItems: InvoiceItem[] | null;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  viewedInvoices: number;
  partiallyPaidInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  cancelledInvoices: number;
  refundedInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  filteredTotal: number;
  filteredTotalAmount: number;
}

export interface InvoiceListResponse {
  success: boolean;
  data: {
    content: Invoice[];
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
  statistics: InvoiceStatistics;
  timestamp: string;
}

export interface InvoiceListParams {
  page?: number;
  size?: number;
  status?: InvoiceStatus;
  clientId?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
