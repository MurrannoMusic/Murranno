import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { PushNotificationProvider } from "./components/app/PushNotificationProvider";
import { NetworkStatus } from "./components/app/NetworkStatus";
import { AppUpdateBanner } from "./components/app/AppUpdateBanner";
import { useDeepLink } from "./hooks/useDeepLink";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobileOnlyRoute } from "./components/auth/MobileOnlyRoute";
import { AdminRoute } from "./components/admin/AdminRoute";
import { DashboardPreviewLayout } from "./components/admin/DashboardPreviewLayout";
import { DashboardRedirect } from "./components/auth/DashboardRedirect";
import { AppLayout } from "./layouts/AppLayout";
import { AppLayoutNoHeader } from "./layouts/AppLayoutNoHeader";
import KYCVerification from "./pages/KYCVerification";
import { KYCProtected } from "./components/auth/KYCProtected";
import { isNativeApp } from "./utils/platformDetection";
import { RouteScrollReset } from "./components/RouteScrollReset";

// Lazy load pages for performance
const Splash = lazy(() => import("./pages/Splash").then(module => ({ default: module.Splash })));
const Welcome = lazy(() => import("./pages/Welcome").then(module => ({ default: module.Welcome })));
const Login = lazy(() => import("./pages/Login").then(module => ({ default: module.Login })));
const Signup = lazy(() => import("./pages/Signup").then(module => ({ default: module.Signup })));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail").then(module => ({ default: module.VerifyEmail })));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(module => ({ default: module.ResetPassword })));
const MarketingDistribution = lazy(() => import("./pages/marketing/Distribution"));
const MarketingPromotions = lazy(() => import("./pages/marketing/Promotions"));
const MarketingArtistProfiles = lazy(() => import("./pages/marketing/ArtistProfiles"));
const MarketingAbout = lazy(() => import("./pages/marketing/About"));
const MarketingContact = lazy(() => import("./pages/marketing/Contact"));
const MarketingDownload = lazy(() => import("./pages/marketing/Download"));
const MarketingJournal = lazy(() => import("./pages/marketing/Journal"));
const MarketingJournalArticle = lazy(() => import("./pages/marketing/JournalArticle"));
// murrannomusic.co serves the marketing site at "/"; app.murrannomusic.co goes straight into the app.
const MARKETING_HOST = typeof window !== "undefined" && /^((www|landing)\.)?murrannomusic\.(co|localhost)$/.test(window.location.hostname); // .localhost: build-time prerender
// On the marketing hosts, account pages (login, signup, the app itself) live on app.murrannomusic.co.
const APP_ONLY_PATH = /^\/(app|admin|login|signup|welcome|forgot-password|reset-password|verify-email|auth|subscription|support|kyc|settings|profile|dashboard|upload|releases|earnings|analytics)(\/|$)/;
function AppHostRedirect() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (MARKETING_HOST && APP_ONLY_PATH.test(pathname)) window.location.replace(`https://app.murrannomusic.co${pathname}${search}${hash}`);
  }, [pathname, search, hash]);
  return null;
}
const DesktopLanding = lazy(() => import("./pages/DesktopLanding").then(module => ({ default: module.DesktopLanding })));
const AuthCallback = lazy(() => import("./pages/AuthCallback").then(module => ({ default: module.AuthCallback })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const LabelDashboard = lazy(() => import("./pages/LabelDashboard").then(module => ({ default: module.LabelDashboard })));
const Releases = lazy(() => import("./pages/Releases")); // Default export check
const ReleaseDetail = lazy(() => import("./pages/ReleaseDetail"));
const Upload = lazy(() => import("./pages/Upload"));
const Promotions = lazy(() => import("./pages/Promotions").then(module => ({ default: module.Promotions })));
const Earnings = lazy(() => import("./pages/Earnings").then(module => ({ default: module.Earnings })));
const Analytics = lazy(() => import("./pages/Analytics").then(module => ({ default: module.Analytics })));
const LabelAnalytics = lazy(() => import("./pages/LabelAnalytics").then(module => ({ default: module.LabelAnalytics })));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard").then(module => ({ default: module.AgencyDashboard })));
const ArtistManagement = lazy(() => import("./pages/ArtistManagement").then(module => ({ default: module.ArtistManagement })));
const CampaignManager = lazy(() => import("./pages/CampaignManager").then(module => ({ default: module.CampaignManager })));
const PayoutManager = lazy(() => import("./pages/PayoutManager").then(module => ({ default: module.PayoutManager })));
const Results = lazy(() => import("./pages/Results").then(module => ({ default: module.Results })));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const ClientManagement = lazy(() => import("./pages/ClientManagement"));
const AgencyAnalyticsDashboard = lazy(() => import("./pages/AgencyAnalyticsDashboard"));
const Profile = lazy(() => import("./pages/Profile").then(module => ({ default: module.Profile })));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile").then(module => ({ default: module.ArtistProfile })));
const Settings = lazy(() => import("./pages/Settings").then(module => ({ default: module.Settings })));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const SubscriptionPlans = lazy(() => import("./pages/SubscriptionPlans"));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then(module => ({ default: module.TermsOfService })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(module => ({ default: module.PrivacyPolicy })));
const FAQ = lazy(() => import("./pages/FAQ").then(module => ({ default: module.FAQ })));
const Support = lazy(() => import("./pages/Support").then(module => ({ default: module.Support })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminFinancials = lazy(() => import("./pages/admin/AdminFinancials"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));
const AdminEmailer = lazy(() => import("./pages/admin/AdminEmailer"));
const AudioDemo = lazy(() => import("./pages/AudioDemo"));
const CampaignPaymentSuccess = lazy(() => import("./pages/CampaignPaymentSuccess"));
const CampaignTracking = lazy(() => import("./pages/CampaignTracking"));
const PreflightCheck = lazy(() => import("./pages/PreflightCheck"));
const DeveloperSettings = lazy(() => import("./pages/DeveloperSettings"));
const DeepLinkTest = lazy(() => import("./pages/DeepLinkTest"));
const PitchTool = lazy(() => import("./pages/tools/PitchTool")); // Default exports
const SmartLinkTool = lazy(() => import("./pages/tools/SmartLinkTool"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount").then(module => ({ default: module.DeleteAccount })));

// Loading Fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

// Component to initialize deep link handler
const DeepLinkInitializer = () => {
  useDeepLink();

  useEffect(() => {
    // Hide splash screen when app is ready
    const hideSplashScreen = async () => {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (e) {
        console.warn('Splash screen plugin not available or failed to hide', e);
      }
    };

    hideSplashScreen();
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="murranno-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppUpdateBanner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouteScrollReset />
          <AppHostRedirect />
          <NetworkStatus />
          <AuthProvider>
            <CurrencyProvider>
              <PushNotificationProvider>
                <DeepLinkInitializer />
                <Routes>
                  {/* The marketing site will live on murrannomusic.co; app.* goes straight into the app (login when signed out). */}
                  {/* murrannomusic.co (and www/landing) open on the marketing landing; app.murrannomusic.co is the web app. */}
                  <Route path="/" element={MARKETING_HOST ? <Suspense fallback={<PageLoader />}><DesktopLanding /></Suspense> : <Navigate to={isNativeApp() ? "/welcome" : "/app"} replace />} />
                  <Route path="/desktop" element={<Navigate to="/app" replace />} />
                  <Route path="/landing" element={<Suspense fallback={<PageLoader />}><DesktopLanding /></Suspense>} />
                  {/* Marketing site (murrannomusic.co). Old WordPress addresses redirect to their new pages. */}
                  <Route path="/distribution" element={<Suspense fallback={<PageLoader />}><MarketingDistribution /></Suspense>} />
                  <Route path="/promotions" element={<Suspense fallback={<PageLoader />}><MarketingPromotions /></Suspense>} />
                  <Route path="/artist-profiles" element={<Suspense fallback={<PageLoader />}><MarketingArtistProfiles /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<PageLoader />}><MarketingAbout /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<PageLoader />}><MarketingContact /></Suspense>} />
                  <Route path="/download" element={<Suspense fallback={<PageLoader />}><MarketingDownload /></Suspense>} />
                  <Route path="/journal" element={<Suspense fallback={<PageLoader />}><MarketingJournal /></Suspense>} />
                  <Route path="/journal/:slug" element={<Suspense fallback={<PageLoader />}><MarketingJournalArticle /></Suspense>} />
                  <Route path="/read-music" element={<Navigate to="/journal" replace />} />
                  <Route path="/blog" element={<Navigate to="/journal" replace />} />
                  <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                  <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
                  <Route path="/nigerian-music-meets-global-fashion" element={<Navigate to="/journal/nigerian-music-meets-global-fashion" replace />} />
                  <Route path="/vinvae-shares-transcendent-boundary-defying-debut-album-when-my-life-began" element={<Navigate to="/journal/vinvae-shares-transcendent-boundary-defying-debut-album-when-my-life-began" replace />} />
                  <Route path="/5-ways-to-develop-your-skills-as-a-songwriter" element={<Navigate to="/journal/5-ways-to-develop-your-skills-as-a-songwriter" replace />} />
                  <Route path="/3-ways-to-embrace-a-curious-musical-mindset-for-songwriting" element={<Navigate to="/journal/3-ways-to-embrace-a-curious-musical-mindset-for-songwriting" replace />} />
                  <Route path="/5-creative-ways-to-attract-new-fans" element={<Navigate to="/journal/5-creative-ways-to-attract-new-fans" replace />} />
                  <Route path="/turning-negativity-into-creativity-in-songwriting" element={<Navigate to="/journal/turning-negativity-into-creativity-in-songwriting" replace />} />
                  <Route path="/10-content-ideas-for-when-youre-stuck" element={<Navigate to="/journal/10-content-ideas-for-when-youre-stuck" replace />} />
                  <Route path="/how-to-use-livestreaming-to-grow-your-music-career" element={<Navigate to="/journal/how-to-use-livestreaming-to-grow-your-music-career" replace />} />
                  <Route path="/headies-2023-full-winners-list" element={<Navigate to="/journal/headies-2023-full-winners-list" replace />} />
                  <Route path="/warner-music-group-blavatnik-family-foundation-social-justice-funds-sjf-repertoire-fund-announces-2023-grantees-in-africa" element={<Navigate to="/journal/warner-music-group-blavatnik-family-foundation-social-justice-funds-sjf-repertoire-fund-announces-2023-grantees-in-africa" replace />} />
                  <Route path="/3-reasons-why-a-flexible-mindset-can-help-your-music-career" element={<Navigate to="/journal/3-reasons-why-a-flexible-mindset-can-help-your-music-career" replace />} />
                  <Route path="/splash" element={isNativeApp() ? <Suspense fallback={<PageLoader />}><Splash /></Suspense> : <Navigate to="/signup" replace />} />
                  <Route path="/welcome" element={isNativeApp() ? <Suspense fallback={<PageLoader />}><Welcome /></Suspense> : <Navigate to="/signup" replace />} />
                  {import.meta.env.DEV && <Route path="/onboarding-preview" element={<Suspense fallback={<PageLoader />}><Welcome /></Suspense>} />}
                  {/* <Route path="/get-started" element={<MobileOnlyRoute><GetStarted /></MobileOnlyRoute>} /> */}
                  <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
                  <Route path="/signup" element={<Suspense fallback={<PageLoader />}><Signup /></Suspense>} />
                  <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
                  <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
                  <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
                  <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />

                  {/* Legal & Support Pages */}
                  <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                  <Route path="/delete-account" element={<Suspense fallback={<PageLoader />}><DeleteAccount /></Suspense>} />
                  <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQ /></Suspense>} />
                  <Route path="/support" element={<Suspense fallback={<PageLoader />}><Support /></Suspense>} />
                  <Route path="/preflight-check" element={<Suspense fallback={<PageLoader />}><PreflightCheck /></Suspense>} />
                  <Route path="/developer-settings" element={<Suspense fallback={<PageLoader />}><DeveloperSettings /></Suspense>} />
                  <Route path="/deep-link-test" element={<Suspense fallback={<PageLoader />}><DeepLinkTest /></Suspense>} />

                  {/* Dashboard Main - Custom Header */}
                  <Route path="/app/dashboard" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                  </Route>

                  {/* Coming Soon / Disabled Routes */}
                  {/* <Route path="/app/label-dashboard" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                <Route index element={<LabelDashboard />} />
              </Route>
              
              <Route path="/app/agency-dashboard" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                <Route index element={<AgencyDashboard />} />
              </Route> */}

                  <Route path="/app/analytics" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
                  </Route>

                  <Route path="/app/earnings" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Earnings /></Suspense>} />
                  </Route>

                  <Route path="/app/profile" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><ArtistProfile /></Suspense>} />
                  </Route>

                  <Route path="/app/settings" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                  </Route>

                  <Route path="/app/promotions" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Promotions /></Suspense>} />
                  </Route>

                  <Route path="/app/releases" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Releases /></Suspense>} />
                  </Route>

                  <Route path="/app/upload" element={<MobileOnlyRoute><ProtectedRoute><AppLayout><KYCProtected><Suspense fallback={<PageLoader />}><Upload /></Suspense></KYCProtected></AppLayout></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><Upload /></Suspense>} />
                  </Route>

                  <Route path="/app/kyc" element={<MobileOnlyRoute><ProtectedRoute><AppLayout><Suspense fallback={<PageLoader />}><KYCVerification /></Suspense></AppLayout></ProtectedRoute></MobileOnlyRoute>} />

                  <Route path="/app/campaign-tracking" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><CampaignTracking /></Suspense>} />
                  </Route>

                  {/* Tools Routes */}
                  <Route path="/app/tools/pitch" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><PitchTool /></Suspense>} />
                  </Route>

                  <Route path="/app/tools/smart-link" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><SmartLinkTool /></Suspense>} />
                  </Route>

                  <Route path="/app/artist-profile" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><ArtistProfile /></Suspense>} />
                  </Route>

                  <Route path="/app/releases/:id" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><ReleaseDetail /></Suspense>} />
                  </Route>

                  <Route path="/app/artist-management/:artistId" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><ArtistDetail /></Suspense>} />
                  </Route>

                  <Route path="/app/news/:id" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<Suspense fallback={<PageLoader />}><NewsDetail /></Suspense>} />
                  </Route>

                  <Route path="/app" element={<MobileOnlyRoute><ProtectedRoute><AppLayout /></ProtectedRoute></MobileOnlyRoute>}>
                    <Route index element={<DashboardRedirect />} />
                    {/* <Route path="user-type-selection" element={<UserTypeSelection />} /> */}
                    {/* <Route path="user-type-switcher" element={<UserTypeSwitcher />} /> */}
                    {/* Dashboard route moved to use AppLayoutNoHeader */}
                    {/* <Route path="dashboard" element={<Dashboard />} /> */}
                    <Route path="label-analytics" element={<Suspense fallback={<PageLoader />}><LabelAnalytics /></Suspense>} />
                    <Route path="artist-management" element={<Suspense fallback={<PageLoader />}><ArtistManagement /></Suspense>} />
                    <Route path="client-management" element={<Suspense fallback={<PageLoader />}><ClientManagement /></Suspense>} />
                    <Route path="agency-analytics" element={<Suspense fallback={<PageLoader />}><AgencyAnalyticsDashboard /></Suspense>} />
                    <Route path="campaign-manager" element={<Suspense fallback={<PageLoader />}><CampaignManager /></Suspense>} />
                    <Route path="payout-manager" element={<Suspense fallback={<PageLoader />}><PayoutManager /></Suspense>} />
                    <Route path="results" element={<Suspense fallback={<PageLoader />}><Results /></Suspense>} />
                    {/* <Route path="subscription/plans" element={<SubscriptionPlans />} /> */}
                    <Route path="audio-demo" element={<Suspense fallback={<PageLoader />}><AudioDemo /></Suspense>} />
                    <Route path="campaign-payment-success" element={<Suspense fallback={<PageLoader />}><CampaignPaymentSuccess /></Suspense>} />
                  </Route>

                  <Route path="/admin" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminUsers /></Suspense></AdminRoute>} />
                  <Route path="/admin/content" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminContent /></Suspense></AdminRoute>} />
                  <Route path="/admin/campaigns" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminCampaigns /></Suspense></AdminRoute>} />
                  <Route path="/admin/promotions" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminPromotions /></Suspense></AdminRoute>} />
                  <Route path="/admin/payments" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminPayments /></Suspense></AdminRoute>} />
                  <Route path="/admin/financials" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminFinancials /></Suspense></AdminRoute>} />
                  <Route path="/admin/subscriptions" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSubscriptions /></Suspense></AdminRoute>} />
                  <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense></AdminRoute>} />
                  <Route path="/admin/notifications" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminNotifications /></Suspense></AdminRoute>} />
                  <Route path="/admin/settings" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSettings /></Suspense></AdminRoute>} />
                  <Route path="/admin/audit-logs" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminAuditLogs /></Suspense></AdminRoute>} />
                  <Route path="/admin/announcements" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminAnnouncements /></Suspense></AdminRoute>} />
                  <Route path="/admin/support" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSupport /></Suspense></AdminRoute>} />
                  <Route path="/admin/kyc" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminKYC /></Suspense></AdminRoute>} />
                  <Route path="/admin/emailer" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminEmailer /></Suspense></AdminRoute>} />

                  {/* Admin preview routes - access all dashboard types */}
                  {/* <Route path="/admin/preview/artist" element={<AdminRoute><DashboardPreviewLayout dashboardType="Artist"><ArtistDashboard /></DashboardPreviewLayout></AdminRoute>} /> */}
                  {/* <Route path="/admin/preview/label" element={<AdminRoute><DashboardPreviewLayout dashboardType="Label"><Suspense fallback={<PageLoader />}><LabelDashboard /></Suspense></DashboardPreviewLayout></AdminRoute>} /> */}
                  {/* <Route path="/admin/preview/agency" element={<AdminRoute><DashboardPreviewLayout dashboardType="Agency"><Suspense fallback={<PageLoader />}><AgencyDashboard /></Suspense></DashboardPreviewLayout></AdminRoute>} /> */}

                  {/* Legacy route redirects */}
                  <Route path="/artist-dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/label-dashboard" element={<Navigate to="/app/label-dashboard" replace />} />
                  <Route path="/agency-dashboard" element={<Navigate to="/app/agency-dashboard" replace />} />
                  <Route path="/upload" element={<Navigate to="/app/upload" replace />} />
                  <Route path="/earnings" element={<Navigate to="/app/earnings" replace />} />
                  <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
                  <Route path="/label-analytics" element={<Navigate to="/app/label-analytics" replace />} />
                  <Route path="/artist-management" element={<Navigate to="/app/artist-management" replace />} />
                  <Route path="/campaign-manager" element={<Navigate to="/app/campaign-manager" replace />} />
                  <Route path="/payout-manager" element={<Navigate to="/app/payout-manager" replace />} />
                  <Route path="/results" element={<Navigate to="/app/results" replace />} />
                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/releases" element={<Navigate to="/app/releases" replace />} />
                  <Route path="/releases/:id" element={<Navigate to="/app/releases/:id" replace />} />
                  <Route path="/subscription/plans" element={<Navigate to="/app/subscription/plans" replace />} />

                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                </Routes>
              </PushNotificationProvider>
            </CurrencyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
