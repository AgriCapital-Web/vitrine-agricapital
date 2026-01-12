import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { usePageTracking } from "@/hooks/usePageTracking";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Pages - using lazy loading for better performance
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminSetup from "./pages/AdminSetup";

// Lazy load admin pages
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminMessaging = lazy(() => import("./pages/admin/AdminMessaging"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminPartnerships = lazy(() => import("./pages/admin/AdminPartnerships"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminForms = lazy(() => import("./pages/admin/AdminForms"));
const AdminMenuNav = lazy(() => import("./pages/admin/AdminMenuNav"));
const AdminSections = lazy(() => import("./pages/admin/AdminSections"));
const AdminTranslations = lazy(() => import("./pages/admin/AdminTranslations"));
const AdminBlocs = lazy(() => import("./pages/admin/AdminBlocs"));
const AdminCMS = lazy(() => import("./pages/admin/AdminCMS"));
const AdminMediaLibrary = lazy(() => import("./pages/admin/AdminMediaLibrary"));
const AdminPageBuilder = lazy(() => import("./pages/admin/AdminPageBuilder"));
const AdminSiteBuilder = lazy(() => import("./pages/admin/AdminSiteBuilder"));
const AdminEmailing = lazy(() => import("./pages/admin/AdminEmailing"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminAIConversations = lazy(() => import("./pages/admin/AdminAIConversations"));
const AdminAutoResponses = lazy(() => import("./pages/admin/AdminAutoResponses"));
const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"));
const AdminVisitorContacts = lazy(() => import("./pages/admin/AdminVisitorContacts"));
const AdminPartnershipRequests = lazy(() => import("./pages/admin/AdminPartnershipRequests"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Evolution = lazy(() => import("./pages/Evolution"));
const PartnershipRequest = lazy(() => import("./pages/PartnershipRequest"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminAdvancedAnalytics = lazy(() => import("./pages/admin/AdminAdvancedAnalytics"));
const AdminPushNotificationsPage = lazy(() => import("./pages/admin/AdminPushNotificationsPage"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  usePageTracking();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Section routes (French) */}
        <Route path="/accueil" element={<HomePage />} />
        <Route path="/a-propos" element={<HomePage />} />
        <Route path="/apropos" element={<HomePage />} />
        <Route path="/notre-approche" element={<HomePage />} />
        <Route path="/approche" element={<HomePage />} />
        <Route path="/impact" element={<HomePage />} />
        <Route path="/jalons" element={<HomePage />} />
        <Route path="/fondateur" element={<HomePage />} />
        <Route path="/partenariat" element={<HomePage />} />
        <Route path="/temoignages" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/evolution" element={<Evolution />} />
        <Route path="/evolution-projet" element={<Evolution />} />
        <Route path="/partenariat-demande" element={<PartnershipRequest />} />
        <Route path="/partnership-request" element={<PartnershipRequest />} />
        <Route path="/actualites" element={<News />} />
        <Route path="/actualites/:slug" element={<NewsArticle />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsArticle />} />
        
        {/* Section routes (English) */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/approach" element={<HomePage />} />
        <Route path="/milestones" element={<HomePage />} />
        <Route path="/founder" element={<HomePage />} />
        <Route path="/partnership" element={<HomePage />} />
        <Route path="/testimonials" element={<HomePage />} />
        
        {/* Language routes */}
        <Route path="/fr" element={<HomePage />} />
        <Route path="/en" element={<HomePage />} />
        <Route path="/ar" element={<HomePage />} />
        <Route path="/es" element={<HomePage />} />
        <Route path="/de" element={<HomePage />} />
        <Route path="/zh" element={<HomePage />} />
        
        {/* Language + Section routes */}
        <Route path="/:lang/:section" element={<HomePage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        <Route path="/admin/messaging" element={<AdminMessaging />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/partnerships" element={<AdminPartnerships />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/seo" element={<AdminSEO />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/media" element={<AdminMedia />} />
        <Route path="/admin/branding" element={<AdminBranding />} />
        <Route path="/admin/forms" element={<AdminForms />} />
        <Route path="/admin/menu" element={<AdminMenuNav />} />
        <Route path="/admin/sections" element={<AdminSections />} />
        <Route path="/admin/translations" element={<AdminTranslations />} />
        <Route path="/admin/blocs" element={<AdminBlocs />} />
        <Route path="/admin/cms" element={<AdminCMS />} />
        <Route path="/admin/media-library" element={<AdminMediaLibrary />} />
        <Route path="/admin/page-builder" element={<AdminPageBuilder />} />
        <Route path="/admin/site-builder" element={<AdminSiteBuilder />} />
        <Route path="/admin/emailing" element={<AdminEmailing />} />
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
        <Route path="/admin/ai-conversations" element={<AdminAIConversations />} />
        <Route path="/admin/auto-responses" element={<AdminAutoResponses />} />
        <Route path="/admin/inbox" element={<AdminInbox />} />
        <Route path="/admin/visitor-contacts" element={<AdminVisitorContacts />} />
        <Route path="/admin/partnership-requests" element={<AdminPartnershipRequests />} />
        <Route path="/admin/news" element={<AdminNews />} />
        <Route path="/admin/advanced-analytics" element={<AdminAdvancedAnalytics />} />
        <Route path="/admin/push-notifications" element={<AdminPushNotificationsPage />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
