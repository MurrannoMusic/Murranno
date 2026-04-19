-- Add unique constraint for campaign_metrics upsert
ALTER TABLE campaign_metrics 
ADD CONSTRAINT campaign_metrics_campaign_date_unique 
UNIQUE (campaign_id, date);