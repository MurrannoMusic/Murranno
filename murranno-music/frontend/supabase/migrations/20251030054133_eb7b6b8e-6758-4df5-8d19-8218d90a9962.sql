-- Phase 1A: Add admin to user_tier enum
ALTER TYPE user_tier ADD VALUE IF NOT EXISTS 'admin';