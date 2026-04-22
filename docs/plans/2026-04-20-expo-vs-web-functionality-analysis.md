# Murranno: Expo vs Web App — Functionality Analysis

**Date:** 2026-04-20  
**Apps:** `murranno-expo` (React Native / Expo Router) vs `murranno-music/frontend` (Vite + React)

---

## 1. Tech Stack Overview

| Dimension | Expo (Mobile) | Web App |
|---|---|---|
| Framework | Expo 55 + React Native 0.83 | Vite 5.4 + React 18.3 |
| Routing | Expo Router (file-based) | React Router DOM 6.30 |
| UI Library | Lucide React Native + custom | Radix UI (50+ primitives) + Tailwind CSS 3.4 |
| State Management | React Context + Async Storage | React Query 5.83 + Context API |
| Forms | Custom / React Native inputs | React Hook Form 7.61 + Zod validation |
| Backend | Supabase + Firebase | Supabase + Capacitor 7.5 |
| Push Notifications | Firebase Messaging + Expo Haptics | — |
| Mobile Bridging | N/A (native) | Capacitor (hybrid layer) |
| Charts | — | Recharts 2.15 |
| Media Upload | Cloudinary (useCloudinaryUpload hook) | Cloudinary (lib/cloudinary.ts) |
| Payments | Paystack (via Supabase Edge Functions) | Paystack (via Supabase Edge Functions) |

---

## 2. Feature-by-Feature Comparison

### 2.1 Authentication

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Sign In | ✅ `sign-in.tsx` | ✅ `Login.tsx` | Both full implementations |
| Sign Up | ✅ `sign-up.tsx` | ✅ `Signup.tsx` | |
| Welcome Screen | ✅ `welcome.tsx` | ✅ `Welcome.tsx` + `Splash.tsx` | Web has separate splash |
| Forgot Password | ❌ Not found | ✅ `ForgotPassword.tsx` | **Gap: Expo missing** |
| Reset Password | ❌ Not found | ✅ `ResetPassword.tsx` | **Gap: Expo missing** |
| Email Verification | ❌ Not found | ✅ `VerifyEmail.tsx` | **Gap: Expo missing** |
| Auth Callback (OAuth) | ❌ Not found | ✅ `AuthCallback.tsx` | **Gap: Expo missing** |
| Auth Context | ✅ (via Supabase client) | ✅ `AuthContext.tsx` | Web has richer context |

---

### 2.2 Dashboard

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Artist Dashboard | ✅ `app/dashboard.tsx` | ✅ `Dashboard.tsx` | Both exist |
| Label Dashboard | ❌ Not found | ✅ `LabelDashboard.tsx` | **Gap: Expo missing** |
| Agency Dashboard | ❌ Not found | ✅ `AgencyDashboard.tsx` | **Gap: Expo missing** |
| Desktop Landing | ❌ Not found | ✅ `DesktopLanding.tsx` | Web-only by design |

---

### 2.3 Music Management

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Music Library | ✅ `app/music.tsx` | ✅ `Music.tsx` | |
| Upload | ✅ `app/upload.tsx` + `useCloudinaryUpload` | ✅ `Upload.tsx` + `lib/cloudinary.ts` | |
| Releases List | ✅ `app/releases.tsx` | ✅ `Releases.tsx` | |
| Release Detail | ❌ Not found | ✅ `ReleaseDetail.tsx` | **Gap: Expo missing** |
| Audio Playback | ❌ Not found | ✅ `components/audio/` | **Gap: Expo missing** |
| Audio Demo | ❌ Not found | ✅ `AudioDemo.tsx` | Web-only |

---

### 2.4 Analytics

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Analytics Screen | ✅ `app/analytics.tsx` + `useAnalyticsData` | ✅ `Analytics.tsx` | |
| Stream Analytics | ✅ `useStreamAnalytics` hook | ✅ included in pages | |
| Label Analytics | ❌ Not found | ✅ `LabelAnalytics.tsx` | **Gap: Expo missing** |
| Agency Analytics | ❌ Not found | ✅ `AgencyAnalyticsDashboard.tsx` | **Gap: Expo missing** |
| Charts | ❌ No charting library | ✅ Recharts 2.15 | **Gap: Expo has no charts** |
| Top Tracks | ✅ `useTopTracks` hook | ✅ included | |

---

### 2.5 Earnings & Wallet

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Earnings Screen | ✅ `app/earnings.tsx` | ✅ `Earnings.tsx` | |
| Wallet Balance | ✅ `useWallet` + `useWalletBalance` | ✅ `components/wallet/` | |
| Payout Manager | ❌ Not found | ✅ `PayoutManager.tsx` | **Gap: Expo missing dedicated page** |
| Payout Methods | ✅ `usePayoutMethods` hook | ✅ included | Data layer exists in both |

---

### 2.6 Campaigns & Promotions

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Promotions Screen | ✅ `components/promotions/` | ✅ `Promotions.tsx` | |
| Campaign Manager | ❌ Not found as dedicated page | ✅ `CampaignManager.tsx` | **Gap: Expo missing** |
| Campaign Tracking | ❌ Not found | ✅ `CampaignTracking.tsx` | **Gap: Expo missing** |
| Campaign Hooks | ✅ `useCampaigns` | ✅ included | Data layer present |
| Campaign Payment Success | ❌ Not found | ✅ `CampaignPaymentSuccess.tsx` | **Gap: Expo missing** |
| Pitch Tool | ❌ Not found | ✅ `tools/PitchTool.tsx` | **Web-only tool** |
| Smart Link Tool | ❌ Not found | ✅ `tools/SmartLinkTool.tsx` | **Web-only tool** |

---

### 2.7 Artist & Team Management

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Artist Profile | ✅ `useArtistProfile` hook | ✅ `ArtistProfile.tsx` + `ArtistDetail.tsx` | |
| Artist Management | ❌ Not found | ✅ `ArtistManagement.tsx` | **Gap: Expo missing** |
| Label Artist Mgmt | ❌ Not found | ✅ via `LabelDashboard` | **Gap: Expo missing** |
| Agency Client Mgmt | ❌ Not found | ✅ via `AgencyDashboard` | **Gap: Expo missing** |

---

### 2.8 KYC & Compliance

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| KYC Verification | ✅ `app/kyc.tsx` | ✅ `KYCVerification.tsx` | Both exist |

---

### 2.9 Subscriptions

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Subscription Plans | ❌ Not found | ✅ `SubscriptionPlans.tsx` | **Gap: Expo missing** |

---

### 2.10 Profile & Account

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Profile | ✅ `app/profile.tsx` | ✅ `Profile.tsx` + `ArtistProfile.tsx` | |
| Account Settings | ✅ `app/account.tsx` | ✅ `Settings.tsx` | |
| Settings | ✅ `app/settings.tsx` | ✅ `Settings.tsx` | |
| Developer Settings | ❌ Not found | ✅ `DeveloperSettings.tsx` | Web-only |
| Preflight Check | ❌ Not found | ✅ `PreflightCheck.tsx` | Web-only diagnostic |
| Deep Link Test | ❌ Not found | ✅ `DeepLinkTest.tsx` | Web-only diagnostic |

---

### 2.11 Support & Legal

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Support | ✅ `app/support.tsx` | ✅ `Support.tsx` | |
| FAQ | ✅ `app/faq.tsx` | ✅ `FAQ.tsx` | |
| Privacy Policy | ✅ `app/privacy.tsx` | ✅ `PrivacyPolicy.tsx` | |
| Terms of Service | ✅ `app/terms.tsx` | ✅ `TermsOfService.tsx` | |
| News Detail | ❌ Not found | ✅ `NewsDetail.tsx` | **Gap: Expo missing** |
| Results Page | ❌ Not found | ✅ `Results.tsx` | **Gap: Expo missing** |

---

### 2.12 Admin Suite

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Admin Dashboard | ✅ `components/admin/` | ✅ `admin/AdminDashboard.tsx` | Expo is component-only |
| Admin Users | ❌ Full page missing | ✅ `AdminUsers.tsx` | **Gap** |
| Admin Analytics | ❌ Full page missing | ✅ `AdminAnalytics.tsx` | **Gap** |
| Admin Campaigns | ❌ Full page missing | ✅ `AdminCampaigns.tsx` | **Gap** |
| Admin Payments | ❌ Full page missing | ✅ `AdminPayments.tsx` | **Gap** |
| Admin Financials | ❌ Full page missing | ✅ `AdminFinancials.tsx` | **Gap** |
| Admin Subscriptions | ❌ Full page missing | ✅ `AdminSubscriptions.tsx` | **Gap** |
| Admin Promotions | ❌ Full page missing | ✅ `AdminPromotions.tsx` | **Gap** |
| Admin KYC | ❌ Full page missing | ✅ `AdminKYC.tsx` | **Gap** |
| Admin Audit Logs | ❌ Full page missing | ✅ `AdminAuditLogs.tsx` | **Gap** |
| Admin Announcements | ❌ Full page missing | ✅ `AdminAnnouncements.tsx` | **Gap** |
| Admin Support | ❌ Full page missing | ✅ `AdminSupport.tsx` | **Gap** |
| Admin Content | ❌ Full page missing | ✅ `AdminContent.tsx` | **Gap** |
| Admin Emailer | ❌ Full page missing | ✅ `AdminEmailer.tsx` | **Gap** |
| Admin Notifications | ❌ Full page missing | ✅ `AdminNotifications.tsx` | **Gap** |
| Admin Settings | ❌ Full page missing | ✅ `AdminSettings.tsx` | **Gap** |

> **Note:** Admin is reasonably a web-only concern. Mobile typically omits full admin suites.

---

### 2.13 Mobile-Only Features (Expo Advantages)

| Feature | Expo | Web App | Notes |
|---|---|---|---|
| Push Notifications | ✅ Firebase Messaging | ❌ | Native push |
| Haptic Feedback | ✅ Expo Haptics | ❌ | |
| Native Storage | ✅ Async Storage | ❌ (uses localStorage) | |
| App-level Theming | ✅ ThemeContext + native | ✅ Next Themes | Both support themes |
| Recent Activity Feed | ✅ `useRecentActivity` | ✅ included | |
| User Type Detection | ✅ `useUserType` | ✅ included | |

---

## 3. Gap Summary

### Critical Gaps in Expo (features web has that mobile lacks)

| Priority | Missing Feature | Impact |
|---|---|---|
| High | Password reset / forgot password flow | Auth blocker for users |
| High | Email verification + auth callback | OAuth / signup completion broken |
| High | Release detail page | Can't view individual release info |
| High | Audio playback component | Can't listen to tracks in-app |
| High | Campaign Manager + Tracking pages | Campaigns are incomplete on mobile |
| High | Charts (no charting library) | Analytics screen has no visualizations |
| Medium | Label & Agency dashboards | Multi-role users lack their views |
| Medium | Label & Agency analytics | |
| Medium | Artist Management page | |
| Medium | Subscription Plans page | Can't upgrade from mobile |
| Medium | Payout Manager page | Payouts require web |
| Medium | News / Results pages | |
| Medium | Campaign payment success confirmation | |
| Low | Developer/preflight/deep-link tools | Diagnostic-only |
| Intentional | Full Admin Suite (16 pages) | Reasonable — keep web-only |

---

## 4. Architecture Assessment

### Shared Foundation (Strength)
- **94 Supabase Edge Functions** are shared verbatim — data contracts are consistent
- **Cloudinary** upload integration exists in both
- **Paystack** payment flows work through the same backend functions
- Both implement the same domain types: analytics, campaigns, earnings, KYC, wallet

### Web App Advantages
- Richer UI component library (50+ Radix primitives vs basic RN components)
- Form validation (Zod + React Hook Form) vs ad-hoc mobile validation
- TanStack Query for server state caching vs raw hooks
- Charts (Recharts) — analytics is more visual
- Full admin panel — 16 dedicated admin pages
- More complete auth flows (password reset, email verify, OAuth callback)

### Expo Advantages
- True native push notifications (Firebase Messaging)
- Haptic feedback on interactions
- Native storage (Async Storage)
- App Store / Play Store distribution
- Offline-capable (with the right patterns)

---

## 5. Recommendations

1. **Auth flows first** — Implement forgot password, reset password, and email verification in Expo. These are table-stakes for production.
2. **Add a charting library** — Without charts, the Analytics screen in Expo is data-only. Consider `react-native-gifted-charts` or `victory-native`.
3. **Release Detail page** — Users managing releases on mobile can't drill into individual releases.
4. **Audio playback** — Core to a music platform; the mobile app should support in-app listening.
5. **Campaign Manager** — Campaign creation and tracking are incomplete on mobile. Prioritize after auth.
6. **Defer admin suite** — Keep admin web-only; this is an appropriate platform boundary.
7. **Consider Subscription Plans page** — Users may want to upgrade from mobile; at minimum show current plan.
