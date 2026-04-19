-- Drop the existing constraint
ALTER TABLE public.releases DROP CONSTRAINT IF EXISTS releases_status_check;
-- Add the corrected constraint including 'Published' and 'Rejected'
ALTER TABLE public.releases
ADD CONSTRAINT releases_status_check CHECK (
        status IN (
            'Draft',
            'Pending',
            'Published',
            'Rejected',
            'Takedown'
        )
    );