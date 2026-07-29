import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const ProductDetail = lazy(() => import('./pages/product/ProductDetail'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const MyPage = lazy(() => import('./pages/mypage/MyPage'))
const SellerDashboard = lazy(() => import('./pages/mypage/SellerDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Community = lazy(() => import('./pages/board/Community'))
const PostDetail = lazy(() => import('./pages/board/PostDetail'))
const PostCreate = lazy(() => import('./pages/board/PostCreate'))
const ProductList = lazy(() => import('./pages/product/ProductList'))

const SellerApplyPage = lazy(() => import('./pages/mypage/SellerApplyPage'))
const SellerShopPage = lazy(() => import('./pages/shop/SellerShopPage'))
const AdminApprovalPage = lazy(() => import('./pages/admin/AdminApprovalPage'))
const OAuth2Onboarding = lazy(() => import('./pages/auth/OAuth2Onboarding'))
const FindPassword = lazy(() => import('./pages/auth/FindPassword'))
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'))
const ShortsFeed = lazy(() => import('./pages/board/ShortsFeed'))
const Terms = lazy(() => import('./pages/policy/Terms'))
const Privacy = lazy(() => import('./pages/policy/Privacy'))
const CustomerCenter = lazy(() => import('./pages/support/CustomerCenter'))

const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminMembersPage = lazy(() => import('./pages/admin/AdminMembersPage'))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
          로딩 중...
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/shop/:sellerId" element={<SellerShopPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/oauth2/onboarding" element={<OAuth2Onboarding />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/apply" element={<SellerApplyPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<AdminApprovalPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/members" element={<AdminMembersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/gallery" element={<Community key="gallery" mode="gallery" />} />
          <Route path="/shorts" element={<ShortsFeed />} />
          <Route path="/lounge" element={<Community key="lounge" mode="lounge" />} />
          <Route path="/notice" element={<Community key="notice" mode="notice" />} />
          <Route path="/community/create" element={<PostCreate />} />
          <Route path="/community/:id" element={<PostDetail />} />
          <Route path="/support" element={<CustomerCenter />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  )
}

export default App
