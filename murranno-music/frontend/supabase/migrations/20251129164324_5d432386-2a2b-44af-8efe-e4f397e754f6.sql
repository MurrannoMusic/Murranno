-- Create function to refund withdrawal to wallet
CREATE OR REPLACE FUNCTION public.refund_withdrawal_to_wallet(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add amount back to available balance and subtract from pending
  UPDATE public.wallet_balance
  SET 
    available_balance = available_balance + p_amount,
    pending_balance = GREATEST(pending_balance - p_amount, 0),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create an adjustment transaction for audit trail
  INSERT INTO public.earnings (
    artist_id,
    amount,
    currency,
    source,
    status,
    period_start,
    period_end
  )
  SELECT 
    a.id,
    p_amount,
    'NGN',
    'withdrawal_refund',
    'completed',
    CURRENT_DATE,
    CURRENT_DATE
  FROM public.artists a
  WHERE a.user_id = p_user_id
  LIMIT 1;
END;
$$;