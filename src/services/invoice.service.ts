// Invoice Service - API Integration

import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/auth';
import type { InvoiceFormData, InvoiceListResponse, InvoiceListParams } from '@/types/invoice';

const INVOICE_BASE_PATH = '/api/v1/invoices';

export class InvoiceService {
  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: InvoiceFormData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(
        INVOICE_BASE_PATH,
        invoiceData,
        true
      );
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        `${INVOICE_BASE_PATH}/${id}`,
        true
      );
      return response;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, invoiceData: Partial<InvoiceFormData>): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(
        `${INVOICE_BASE_PATH}/${id}`,
        invoiceData,
        true
      );
      return response;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<any>(
        `${INVOICE_BASE_PATH}/${id}`,
        true
      );
      return response;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Get all invoices with pagination and filters
   */
  async getInvoices(params?: InvoiceListParams): Promise<InvoiceListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size !== undefined) {
        queryParams.append('size', params.size.toString());
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.clientId) {
        queryParams.append('clientId', params.clientId);
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortDir) {
        queryParams.append('sortDir', params.sortDir);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `${INVOICE_BASE_PATH}?${queryString}` : INVOICE_BASE_PATH;

      const response = await apiClient.get<InvoiceListResponse>(endpoint, true);
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
