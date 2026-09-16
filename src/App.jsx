import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
// Add page imports here
import StoreLayout from "@/components/store/StoreLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import { CartProvider } from "@/lib/cartContext";
import { CurrencyProvider } from "@/lib/currencyContext";
import { QuickViewProvider } from "@/lib/quickViewContext";
import { WishlistProvider } from "@/lib/wishlistContext";
import { CompareProvider } from "@/lib/compareContext";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import About from "@/pages/About";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import ContentPage from "@/pages/ContentPage";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import TrackOrder from "@/pages/TrackOrder";
import MyOrders from "@/pages/MyOrders";
import Profile from "@/pages/Profile";
import DownloadSite from "@/pages/DownloadSite";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminPages from "@/pages/admin/AdminPages";
import AdminPageBuilder from "@/pages/admin/AdminPageBuilder";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminBlog from "@/pages/admin/AdminBlog";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<CartProvider><QuickViewProvider><CurrencyProvider><WishlistProvider><CompareProvider><StoreLayout /></CompareProvider></WishlistProvider></CurrencyProvider></QuickViewProvider></CartProvider>}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/download-site" element={<DownloadSite />} />
        <Route path="/page/:slug" element={<ContentPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Route>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Admin (auth required) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="builder" element={<AdminPageBuilder />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="blog" element={<AdminBlog />} />
      </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App