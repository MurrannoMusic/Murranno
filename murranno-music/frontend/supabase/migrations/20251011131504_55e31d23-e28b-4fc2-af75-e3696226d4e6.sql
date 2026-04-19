-- Create payout methods table
CREATE TABLE payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'bank',
  recipient_code TEXT UNIQUE NOT NULL,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payout_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payout_methods
CREATE POLICY "Users can view their own payout methods"
  ON payout_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payout methods"
  ON payout_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payout methods"
  ON payout_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payout methods"
  ON payout_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Create withdrawal transactions table
CREATE TABLE withdrawal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payout_method_id UUID REFERENCES payout_methods(id),
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending',
  transfer_code TEXT UNIQUE,
  reference TEXT UNIQUE NOT NULL,
  description TEXT,
  paystack_response JSONB,
  failure_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE withdrawal_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawal_transactions
CREATE POLICY "Users can view their own transactions"
  ON withdrawal_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON withdrawal_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create wallet balance table
CREATE TABLE wallet_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallet_balance ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet_balance
CREATE POLICY "Users can view their own balance"
  ON wallet_balance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance"
  ON wallet_balance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance"
  ON wallet_balance FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_payout_methods_updated_at
  BEFORE UPDATE ON payout_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_transactions_updated_at
  BEFORE UPDATE ON withdrawal_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_balance_updated_at
  BEFORE UPDATE ON wallet_balance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();