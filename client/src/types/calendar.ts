export interface CalendarConnectionStatus {
  isConnected: boolean;
  googleAccountEmail?: string;
  updatedAt?: string;
}

export type CalendarSyncStatus = 'NOT_REQUIRED' | 'PENDING' | 'SYNCED' | 'FAILED';
