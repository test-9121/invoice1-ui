// Reports Service - API Integration

import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/auth';

const REPORTS_BASE_PATH = '/api/v1/reports';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  clientId?: number | null;
  status?: 'all' | 'paid' | 'pending' | 'overdue';
  period?: 'last_6_months' | 'last_3_months' | 'last_30_days' | 'this_year' | 'custom';
}

export interface SummaryStatValue {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface ReportsSummary {
  totalInvoices: SummaryStatValue;
  paidInvoices: SummaryStatValue;
  unpaidInvoices: SummaryStatValue;
  totalRevenue: SummaryStatValue & {
    currency: string;
  };
}

export interface InvoiceVolumeData {
  period: string;
  label: string;
  count: number;
}

export interface PaymentStatusData {
  status: 'paid' | 'pending' | 'overdue';
  count: number;
  percentage: number;
}

export interface RevenueTrendData {
  period: string;
  label: string;
  revenue: number;
}

export interface ClientOption {
  id: number;
  name: string;
}

export interface ReportsData {
  summary: ReportsSummary;
  invoiceVolume: InvoiceVolumeData[];
  paymentStatus: PaymentStatusData[];
  revenueTrend: RevenueTrendData[];
  clients: ClientOption[];
  filters: {
    appliedFilters: ReportFilters;
  };
}

export class ReportsService {
  /**
   * Get all reports data with filters
   */
  async getReportsData(filters?: ReportFilters): Promise<ApiResponse<ReportsData>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters?.clientId) {
        queryParams.append('clientId', filters.clientId.toString());
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters?.period) {
        queryParams.append('period', filters.period);
      }

      const url = queryParams.toString() 
        ? `${REPORTS_BASE_PATH}?${queryParams.toString()}`
        : REPORTS_BASE_PATH;

      const response = await apiClient.get<ApiResponse<ReportsData>>(url, true);
      return response;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      throw error;
    }
  }

  /**
   * Export report as PDF or Excel
   */
  async exportReport(filters?: ReportFilters, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters?.clientId) {
        queryParams.append('clientId', filters.clientId.toString());
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters?.period) {
        queryParams.append('period', filters.period);
      }

      const url = `${REPORTS_BASE_PATH}/export?${queryParams.toString()}`;

      // Fetch as blob for file download
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Download exported report
   */
  downloadExportedReport(blob: Blob, format: 'pdf' | 'excel' = 'pdf'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportsService = new ReportsService();
