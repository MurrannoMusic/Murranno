-- Update Streaming & Playlist Promotion services
UPDATE promotion_services
SET image_url = '/services/streaming_promo.jpg'
WHERE category = 'Streaming & Playlist Promotion';
-- Update Digital & Social Media Marketing services
UPDATE promotion_services
SET image_url = '/services/social_media.jpg'
WHERE category = 'Digital & Social Media Marketing';
-- Update Press & Media Promotions services
UPDATE promotion_services
SET image_url = '/services/press_media.jpg'
WHERE category = 'Press & Media Promotions';
-- Update Radio Promotions services
UPDATE promotion_services
SET image_url = '/services/radio_promo.jpg'
WHERE category = 'Radio Promotions';
-- Update Interviews & Appearances (using Press image for now or Radio)
UPDATE promotion_services
SET image_url = '/services/press_media.jpg'
WHERE category = 'Interviews & Appearances';
-- Update Events & Experiences
UPDATE promotion_services
SET image_url = '/services/events.jpg'
WHERE category = 'Events & Experiences';
-- Update Direct Marketing (using Social image)
UPDATE promotion_services
SET image_url = '/services/social_media.jpg'
WHERE category = 'Direct Marketing';