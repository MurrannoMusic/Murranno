# Promotions System Setup Guide

## Overview

The full-service promotional catalog system has been implemented with:
- **27 individual promotional services** across 7 categories
- **4 tiered promotional bundles** (Starter, Growth, Momentum, Supernova Junkets)
- Complete campaign management integration

## Database Schema

### New Tables Created

1. **promotion_services** - Individual promotional services
   - Contains all 27 services with pricing in Naira
   - Categorized into 7 service types
   - Features, duration, and descriptions

2. **promotion_bundles** - Pre-configured service packages
   - 4 tiered bundles from ₦500K to ₦5M
   - Target descriptions for each tier
   - Tier level indicators

3. **bundle_services** - Junction table linking bundles to services
   - Maps which services are included in each bundle

4. **campaign_services** - Junction table for campaign service tracking
   - Links campaigns to individual services
   - Tracks service delivery status (pending/in_progress/completed)

### Extended Tables

**campaigns** table now includes:
- `promotion_type` - 'individual', 'bundle', or 'custom'
- `bundle_id` - Reference to selected bundle (if applicable)
- `category` - Service category (if individual service)

## Seeding Initial Data

### Step 1: Seed Promotional Services and Bundles

As an **admin user**, call the seed function:

```javascript
const { data, error } = await supabase.functions.invoke('seed-promotion-services');
```

This will populate:
- All 27 promotional services
- All 4 promotional bundles
- Bundle-service associations

### Step 2: Verify Data

Check that services were created:
```sql
SELECT COUNT(*) FROM promotion_services;
-- Should return 27

SELECT COUNT(*) FROM promotion_bundles;
-- Should return 4

SELECT COUNT(*) FROM bundle_services;
-- Should return approximately 70+ (services across all bundles)
```

## Service Categories

1. **Streaming & Playlist Promotion** (9 services)
   - Playlist pitching, canvas activation, lyrics videos
   - Price range: ₦20,000 - ₦100,000

2. **Digital & Social Media Marketing** (3 services)
   - Influencer marketing, TikTok challenges, BTS content
   - Price range: ₦50,000 - ₦1,000,000

3. **Press & Media Promotions** (6 services)
   - Press releases, blog features, magazine interviews, TV features
   - Price range: ₦150,000 - ₦2,000,000

4. **Radio Promotions** (3 services)
   - Radio airplay, spin campaigns, interviews
   - Price range: ₦300,000 - ₦1,000,000

5. **Interviews & Appearances** (3 services)
   - Podcast features, YouTube talk shows, Twitter Spaces
   - Price range: ₦200,000 - ₦300,000

6. **Events & Experiences** (2 services)
   - Listening parties, club performances
   - Price: ₦3,000,000 each

7. **Direct Marketing** (1 service)
   - Email marketing campaigns
   - Price: ₦50,000

## Promotional Bundles (Junkets)

### 1. Starter Junket - ₦500,000
**Target:** Entry-level digital visibility for emerging artists

**Includes:**
- Apple Music Playlist Pitching
- Spotify Playlist Pitching
- Curator Playlist Placement
- Lyrics Video

### 2. Growth Junket - ₦1,000,000 (Recommended)
**Target:** Balanced media exposure and streaming growth

**Includes:**
- All Starter Junket services
- Press Releases
- Radio Interviews
- Twitter Spaces

### 3. Momentum Junket - ₦3,000,000
**Target:** Multi-platform growth and strong media penetration

**Includes:**
- All Growth Junket services
- Blog Features
- Magazine Interviews
- TV Features
- Influencer Marketing
- Behind-The-Scenes Content
- Multiple playlist placements

### 4. Supernova Junket - ₦5,000,000
**Target:** Comprehensive industry domination for high-tier artists

**Includes:**
- All Momentum Junket services
- Press Run (Full Media Tour)
- Radio Airplay & Spin Campaign
- Podcast Features
- YouTube Talk Shows
- Listening Party Setup
- Club Performances
- Wikipedia Setup
- Email Marketing

## User Flow

### For Artists

1. **Navigate to Promotions Page** (`/promotions`)
2. **Choose Tab:**
   - **Promotional Junkets**: View pre-packaged bundles
   - **Individual Services**: Browse services by category
3. **Select Service or Bundle**
4. **Create Campaign:**
   - Name the campaign (optional)
   - Select release to promote
   - Review pricing
5. **Create Campaign** (Status: Draft)
6. **Proceed to Payment** (to activate campaign)

### For Admins

**Manage Services:**
- View all services in database
- Add/edit/deactivate services
- Update pricing and features

**Manage Bundles:**
- Create custom bundles
- Modify bundle compositions
- Adjust pricing

**Campaign Fulfillment:**
- Track campaign service delivery
- Update service status (pending → in_progress → completed)
- Monitor campaign performance

## UI Components

### ServiceCard
- Displays individual service details
- Shows pricing, category, features
- "Select Service" action button

### BundleCard
- Displays bundle tier and pricing
- Expandable service list
- Tier-based color coding
- Recommended badge for Growth Junket

### CategoryFilter
- Filter services by category
- Service count badges
- "All Services" option

### CampaignDialog
- Unified dialog for both services and bundles
- Release selection
- Campaign name customization
- Price display
- Service/bundle summary

## API Endpoints

### Edge Functions

**get-promotion-services**
- Fetches all active services
- Supports category filtering
- Public access (no JWT required)

**get-promotion-bundles**
- Fetches bundles with included services
- Returns complete service details
- Public access (no JWT required)

**seed-promotion-services**
- Admin-only function
- Populates initial data
- Idempotent (safe to re-run)

**create-campaign** (updated)
- Now supports `promotion_type`, `bundle_id`, `category`
- Creates campaign with proper service associations
- Links bundle or individual services

## Custom Hooks

### usePromotionServices
```typescript
const { services, loading, categories, refetch } = usePromotionServices();
```
- Fetches all services
- Supports category filtering
- Returns service categories

### usePromotionBundles
```typescript
const { bundles, loading, refetch } = usePromotionBundles();
```
- Fetches bundles with included services
- Sorted by tier level
- Returns complete bundle data

## Type Definitions

Located in `src/types/promotion.ts`:

```typescript
PromotionCategory
PromotionService
PromotionBundle
CampaignService
```

## Next Steps & Future Enhancements

### Phase 1 - Payment Integration
- [ ] Integrate Paystack for campaign payments
- [ ] Payment status tracking
- [ ] Auto-activate campaigns on payment success
- [ ] Payment receipts and invoices

### Phase 2 - Service Delivery Tracking
- [ ] Admin dashboard for campaign fulfillment
- [ ] Service delivery status updates
- [ ] Artist notifications on service completion
- [ ] Campaign progress tracking

### Phase 3 - Custom Packages
- [ ] Shopping cart for multiple services
- [ ] Price calculator
- [ ] Save custom packages
- [ ] Discount for bulk selections

### Phase 4 - Analytics & Reporting
- [ ] Campaign performance metrics
- [ ] ROI tracking per service type
- [ ] Service effectiveness analysis
- [ ] Automated reporting

### Phase 5 - Advanced Features
- [ ] Service recommendations based on artist tier
- [ ] Bundle comparison tool
- [ ] Testimonials and case studies
- [ ] Campaign scheduling
- [ ] Recurring campaigns

## Security Considerations

- All RLS policies properly configured
- Admin-only access to seed and manage services
- Users can only create campaigns for their own releases
- Service prices stored in Naira (no currency conversion risks)
- Campaign budget validation

## Testing Checklist

- [ ] Seed data successfully populates
- [ ] All 27 services visible in UI
- [ ] All 4 bundles visible in UI
- [ ] Category filtering works
- [ ] Service selection opens dialog
- [ ] Bundle selection opens dialog
- [ ] Campaign creation with service works
- [ ] Campaign creation with bundle works
- [ ] Release selection dropdown populates
- [ ] Pricing displays correctly in Naira
- [ ] Mobile responsive design works
- [ ] Tab switching functions properly

## Support

For issues or questions about the promotional system:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Ensure seed data was populated
4. Check RLS policies are active
5. Verify user has proper permissions

## Changelog

### v1.0.0 - Initial Implementation
- Created full database schema
- Implemented 27 promotional services
- Created 4 promotional bundles
- Built UI components and pages
- Integrated with campaign system
- Added data seeding functionality
