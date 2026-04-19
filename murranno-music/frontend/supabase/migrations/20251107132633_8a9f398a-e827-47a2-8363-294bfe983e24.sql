-- Enable realtime for campaigns table
ALTER TABLE public.campaigns REPLICA IDENTITY FULL;

-- Add campaigns table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;