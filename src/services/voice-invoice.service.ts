// Voice Invoice Service

import { apiClient } from '@/lib/api-client';
import type { VoiceInvoiceData } from '@/types/invoice';
import type { ApiResponse } from '@/types/auth';

const VOICE_INVOICE_BASE_PATH = '/api/v1/voice-invoice';

export class VoiceInvoiceService {
  /**
   * Parse voice transcript and extract invoice data
   */
  async parseVoiceTranscript(transcript: string): Promise<ApiResponse<VoiceInvoiceData>> {
    try {
      console.log('[VoiceInvoiceService] Sending transcript to backend:', transcript);
      
      const response = await apiClient.post<ApiResponse<VoiceInvoiceData>>(
        `${VOICE_INVOICE_BASE_PATH}/parse`,
        { transcript },
        true
      );

      console.log('[VoiceInvoiceService] Received response:', response);
      return response;
    } catch (error) {
      console.error('[VoiceInvoiceService] Error parsing transcript:', error);
      throw error;
    }
  }
}

export const voiceInvoiceService = new VoiceInvoiceService();
