# Edge Functions API Documentation

This document provides a comprehensive overview of all backend edge functions available in the Murranno platform.

## Table of Contents
1. [Authentication & User Management](#authentication--user-management)
2. [Artist Profile Management](#artist-profile-management)
3. [Release & Track Management](#release--track-management)
4. [Label Management](#label-management)
5. [Campaign Management](#campaign-management)
6. [Analytics & Statistics](#analytics--statistics)
7. [Wallet & Earnings](#wallet--earnings)
8. [Payout Methods](#payout-methods)
9. [Subscription Management](#subscription-management)
10. [Paystack Integration](#paystack-integration)

---

## Authentication & User Management

### get-profile
**Purpose**: Retrieve the current user's profile information including subscription details.

**Request**: No body required (authenticated)

**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "tier": "artist",
    "subscription": {
      "status": "active",
      "tier": "artist",
      "trial_ends_at": "2024-12-31T00:00:00Z"
    }
  }
}
```

### update-profile
**Purpose**: Update user profile information.

**Request**:
```json
{
  "full_name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "profile": { ... }
}
```

---

## Artist Profile Management

### create-artist-profile
**Purpose**: Create an artist profile for the authenticated user.

**Request**:
```json
{
  "stage_name": "DJ Luna",
  "bio": "Electronic music producer",
  "profile_image": "https://...",
  "spotify_id": "spotify:artist:123",
  "apple_music_id": "apple:artist:456"
}
```

**Response**:
```json
{
  "success": true,
  "artist": {
    "id": "uuid",
    "user_id": "uuid",
    "stage_name": "DJ Luna",
    "bio": "Electronic music producer",
    ...
  }
}
```

### update-artist-profile
**Purpose**: Update the authenticated user's artist profile.

**Request**:
```json
{
  "stage_name": "DJ Luna Sol",
  "bio": "Updated bio",
  "profile_image": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "artist": { ... }
}
```

### get-artist-profile
**Purpose**: Retrieve artist profile with earnings and release statistics.

**Query Parameters**:
- `artistId` (optional): For labels to view their artists

**Response**:
```json
{
  "success": true,
  "artist": {
    "id": "uuid",
    "stage_name": "DJ Luna",
    "totalEarnings": 5000,
    "pendingEarnings": 1000,
    "releaseCount": 12,
    ...
  }
}
```

---

## Release & Track Management

### create-release
**Purpose**: Create a new music release.

**Request**:
```json
{
  "title": "Summer Vibes EP",
  "release_type": "EP",
  "release_date": "2024-06-01",
  "genre": "Electronic",
  "label": "Independent",
  "cover_art_url": "https://...",
  "upc_ean": "1234567890123",
  "copyright": "2024 DJ Luna",
  "language": "English"
}
```

**Response**:
```json
{
  "success": true,
  "release": {
    "id": "uuid",
    "title": "Summer Vibes EP",
    "status": "Draft",
    ...
  }
}
```

### update-release
**Purpose**: Update an existing release.

**Query Parameters**:
- `id`: Release ID

**Request**:
```json
{
  "title": "Updated Title",
  "status": "Published",
  "smartlink": "https://linktr.ee/..."
}
```

**Response**:
```json
{
  "success": true,
  "release": { ... }
}
```

### delete-release
**Purpose**: Delete a release (only if no active campaigns).

**Query Parameters**:
- `id`: Release ID

**Response**:
```json
{
  "success": true,
  "message": "Release deleted successfully"
}
```

### delete-track
**Purpose**: Delete a track from a release.

**Query Parameters**:
- `releaseId`: Release ID
- `trackId`: Track ID

**Response**:
```json
{
  "success": true,
  "message": "Track deleted successfully"
}
```

### get-user-releases
**Purpose**: Get all releases for the authenticated user.

**Response**:
```json
{
  "success": true,
  "releases": [
    {
      "id": "uuid",
      "title": "Summer Vibes EP",
      "status": "Published",
      "release_date": "2024-06-01",
      "tracks": [...],
      ...
    }
  ]
}
```

### get-release-detail
**Purpose**: Get detailed information about a specific release.

**Query Parameters**:
- `releaseId`: Release ID

**Response**: Detailed release with tracks and analytics.

---

## Label Management

### add-artist-to-label
**Purpose**: Add an artist to a label (label users only).

**Request**:
```json
{
  "artist_id": "uuid",
  "contract_start_date": "2024-01-01",
  "contract_end_date": "2025-12-31",
  "revenue_share_percentage": 70
}
```

**Response**:
```json
{
  "success": true,
  "relationship": {
    "id": "uuid",
    "artist_id": "uuid",
    "label_id": "uuid",
    "status": "active",
    ...
  }
}
```

### remove-artist-from-label
**Purpose**: Remove an artist from a label.

**Request**:
```json
{
  "artist_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Artist removed from label"
}
```

### get-label-artists
**Purpose**: Get all artists managed by a label.

**Response**:
```json
{
  "success": true,
  "artists": [
    {
      "id": "uuid",
      "stage_name": "Artist Name",
      "contract_start_date": "2024-01-01",
      "revenue_share_percentage": 70,
      ...
    }
  ]
}
```

---

## Campaign Management

### create-campaign
**Purpose**: Create a new marketing campaign.

**Request**:
```json
{
  "name": "Summer Release Campaign",
  "type": "Social Media",
  "platform": "Instagram",
  "budget": 5000,
  "start_date": "2024-06-01",
  "end_date": "2024-06-30",
  "artist_id": "uuid",
  "release_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "campaign": {
    "id": "uuid",
    "name": "Summer Release Campaign",
    "status": "Draft",
    ...
  }
}
```

### update-campaign
**Purpose**: Update an existing campaign.

**Query Parameters**:
- `id`: Campaign ID

**Request**:
```json
{
  "status": "Active",
  "budget": 6000
}
```

**Response**:
```json
{
  "success": true,
  "campaign": { ... }
}
```

### delete-campaign
**Purpose**: Delete a campaign.

**Query Parameters**:
- `id`: Campaign ID

**Response**:
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

### get-user-campaigns
**Purpose**: Get all campaigns for the authenticated user.

**Request**:
```json
{
  "status": "Active" // optional filter
}
```

**Response**:
```json
{
  "success": true,
  "campaigns": [...],
  "stats": {
    "totalCampaigns": 10,
    "activeCampaigns": 3,
    "totalSpent": 25000,
    "totalReach": 150000
  }
}
```

### get-campaign-metrics
**Purpose**: Get historical metrics for a campaign.

**Query Parameters**:
- `id`: Campaign ID

**Response**:
```json
{
  "success": true,
  "metrics": [
    {
      "date": "2024-06-01",
      "impressions": 5000,
      "clicks": 250,
      "conversions": 50,
      "spend": 100
    }
  ]
}
```

---

## Analytics & Statistics

### get-analytics-data
**Purpose**: Get streaming and earnings analytics for a period.

**Request**:
```json
{
  "period": 30, // days
  "artistId": "uuid" // optional
}
```

**Response**:
```json
{
  "success": true,
  "streamsByDate": {
    "2024-06-01": 1500,
    "2024-06-02": 1800,
    ...
  },
  "streamsByPlatform": {
    "Spotify": 5000,
    "Apple Music": 3000,
    ...
  },
  "totalStreams": 50000,
  "totalEarnings": 5000,
  "period": 30
}
```

### fetch-analytics
**Purpose**: Fetch comprehensive analytics data (legacy function).

---

## Wallet & Earnings

### get-wallet-balance
**Purpose**: Get the user's wallet balance.

**Response**:
```json
{
  "success": true,
  "balance": {
    "id": "uuid",
    "user_id": "uuid",
    "available_balance": 5000,
    "pending_balance": 1000,
    "total_earnings": 10000,
    "currency": "NGN"
  }
}
```

### get-wallet-transactions
**Purpose**: Get withdrawal transaction history.

**Request**:
```json
{
  "limit": 50,
  "status": "paid" // optional filter
}
```

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "amount": 5000,
      "status": "paid",
      "requested_at": "2024-06-01T00:00:00Z",
      "payout_methods": {
        "type": "bank",
        "account_name": "John Doe",
        "account_number": "1234567890",
        "bank_name": "GTBank"
      }
    }
  ]
}
```

### get-earnings-breakdown
**Purpose**: Get earnings breakdown by source and platform.

**Request**:
```json
{
  "period": 30,
  "artistId": "uuid" // optional
}
```

**Response**:
```json
{
  "success": true,
  "sources": [
    {
      "platform": "Spotify",
      "amount": 3000,
      "percentage": 60
    },
    {
      "platform": "Apple Music",
      "amount": 2000,
      "percentage": 40
    }
  ]
}
```

---

## Payout Methods

### get-payout-methods
**Purpose**: Get all payout methods for the authenticated user.

**Response**:
```json
{
  "success": true,
  "payoutMethods": [
    {
      "id": "uuid",
      "type": "bank",
      "bank_name": "GTBank",
      "account_number": "1234567890",
      "account_name": "John Doe",
      "is_primary": true,
      "is_verified": true
    }
  ]
}
```

### delete-payout-method
**Purpose**: Delete a payout method.

**Request**:
```json
{
  "payoutMethodId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payout method deleted successfully"
}
```

### paystack-set-primary-method
**Purpose**: Set a payout method as primary.

**Request**:
```json
{
  "payoutMethodId": "uuid"
}
```

**Response**:
```json
{
  "success": true
}
```

---

## Subscription Management

### get-subscription-status
**Purpose**: Get current subscription status and details.

**Response**:
```json
{
  "success": true,
  "subscription": {
    "tier": "artist",
    "status": "active",
    "isActive": true,
    "isTrial": false,
    "trialEnded": false,
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "subscription_plans": {
      "name": "Artist Plan",
      "price_monthly": 2000,
      "currency": "NGN",
      "features": {...}
    }
  }
}
```

### get-subscription-plans
**Purpose**: Get all available subscription plans.

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "tier": "artist",
      "name": "Artist Plan",
      "price_monthly": 2000,
      "currency": "NGN",
      "max_artists": null,
      "features": {...}
    }
  ],
  "currentTier": "artist",
  "currentStatus": "active"
}
```

### update-subscription-tier
**Purpose**: Update user's subscription tier.

**Request**:
```json
{
  "tier": "label"
}
```

**Response**:
```json
{
  "success": true,
  "subscription": {...},
  "message": "Tier updated successfully"
}
```

---

## Paystack Integration

### get-withdrawal-status
**Purpose**: Check the status of a withdrawal transaction.

**Query Parameters**:
- `id`: Transaction ID

**Response**:
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "paid",
    "amount": 5000,
    "transfer_code": "TRF_xxx",
    "paystack_response": {...}
  }
}
```

### paystack-create-recipient
**Purpose**: Create a Paystack recipient for withdrawals.

### paystack-get-banks
**Purpose**: Get list of supported banks.

### paystack-resolve-account
**Purpose**: Verify bank account details.

### paystack-initiate-withdrawal
**Purpose**: Initiate a withdrawal to a payout method.

---

## Error Handling

All edge functions return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Authentication

All endpoints (except public ones) require authentication via Supabase Auth. Include the authorization header:

```
Authorization: Bearer <supabase-jwt-token>
```

The user ID is automatically extracted from the JWT token for RLS policy enforcement.

---

## Rate Limiting

Edge functions are subject to Lovable Cloud's standard rate limits. For high-volume operations, consider batching requests or implementing client-side caching.

---

## Best Practices

1. **Error Handling**: Always check for `success: true` in responses
2. **Null Checks**: Handle cases where data might be `null` or empty
3. **Validation**: Validate input data before making requests
4. **Caching**: Cache frequently accessed data like subscription plans
5. **Optimistic Updates**: Update UI optimistically, then sync with backend
6. **Loading States**: Show loading indicators during async operations
7. **Toast Notifications**: Provide user feedback for all operations

---

## Security Considerations

1. All edge functions enforce Row Level Security (RLS)
2. User data is isolated by `user_id`
3. Labels can only access their managed artists
4. Sensitive operations require explicit user authentication
5. Paystack secrets are stored securely in Supabase
6. All database operations use parameterized queries

---

## Development & Testing

To test edge functions locally:

```bash
# Use Supabase CLI or invoke from frontend
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ... }
});
```

For debugging, check edge function logs in the Lovable Cloud backend interface.
