// Dashboard Service - API Integration

import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/auth';

const DASHBOARD_BASE_PATH = '/api/v1/dashboard';

export interface StatValue {
  count?: number;
  amount?: number;
  currency?: string;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardStatistics {
  totalInvoices: StatValue;
  unpaidInvoices: StatValue;
  totalRevenue: StatValue;
  activeClients: StatValue;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  totalAmount: number;
  status: string;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  recentInvoices: RecentInvoice[];
}

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<ApiResponse<DashboardStatistics>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStatistics>>(
        `${DASHBOARD_BASE_PATH}/statistics`,
        true
      );
      return response;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get recent invoices
   */
  async getRecentInvoices(limit: number = 5): Promise<ApiResponse<RecentInvoice[]>> {
    try {
      const response = await apiClient.get<ApiResponse<RecentInvoice[]>>(
        `${DASHBOARD_BASE_PATH}/recent-invoices?limit=${limit}`,
        true
      );
      return response;
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      throw error;
    }
  }

  /**
   * Get all dashboard data at once
   */
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        DASHBOARD_BASE_PATH,
        true
      );
      return response;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
