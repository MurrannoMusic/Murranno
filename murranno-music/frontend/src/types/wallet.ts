export type TransactionStatus = 'paid' | 'pending' | 'processing' | 'failed' | 'cancelled';
export type PayoutMethodType = 'bank' | 'mobile_money' | 'payoneer' | 'paypal';
export type TransactionType = 'withdrawal' | 'earning' | 'refund' | 'adjustment';

export interface EarningsTransaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  method: PayoutMethodType;
  status: TransactionStatus;
  requestedDate: string;
  completedDate?: string;
  description: string;
  source?: string;
  transactionId: string;
  fee?: number;
  netAmount: number;
}

export interface PayoutMethod {
  id: string;
  type: PayoutMethodType;
  name: string;
  details: string;
  verified: boolean;
  isPrimary: boolean;
  icon: string;
  lastUsed?: string;
}

export interface WalletBalance {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  thisMonth: number;
  lastMonth: number;
  percentageChange: number;
}

export interface EarningsSource {
  id: string;
  platform: string;
  amount: number;
  percentage: number;
  growth: number;
  icon: string;
  streams?: number;
  sales?: number;
}
