ALTER TABLE releases ADD COLUMN secondary_genre TEXT;
ALTER TABLE releases ADD COLUMN description TEXT;
ALTER TABLE tracks ADD COLUMN featured_artists TEXT_ARRAY;
ALTER TABLE tracks ADD COLUMN producers TEXT_ARRAY;
