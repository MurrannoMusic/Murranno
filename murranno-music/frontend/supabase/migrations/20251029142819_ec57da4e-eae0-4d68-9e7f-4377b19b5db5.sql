-- Set all subscription plans to free for development
UPDATE subscription_plans 
SET price_monthly = 0 
WHERE tier IN ('label', 'agency');