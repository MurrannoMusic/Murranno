export interface Payout {
  id: number;
  artist: string;
  amount: string;
  period: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Paid' | 'Processing' | 'Failed';
  requestDate: string;
  streams: string;
  type: 'Monthly' | 'Quarterly' | 'Annual';
  completedDate?: string;
  transactionId?: string;
}

export interface PayoutSummary {
  totalPending: number;
  thisMonth: number;
  totalAvailable: string;
}