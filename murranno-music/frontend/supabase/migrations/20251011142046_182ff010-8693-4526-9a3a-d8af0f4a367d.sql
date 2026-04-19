-- Enable realtime for wallet_balance table
ALTER TABLE public.wallet_balance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_balance;