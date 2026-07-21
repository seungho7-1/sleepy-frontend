import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const MyPage = lazy(() => import('./pages/MyPage'))
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Community = lazy(() => import('./pages/Community'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const PostCreate = lazy(() => import('./pages/PostCreate'))

const SellerApplyPage = lazy(() => import('./pages/SellerApplyPage'))
const AdminApprovalPage = lazy(() => import('./pages/AdminApprovalPage'))
const OAuth2Onboarding = lazy(() => import('./pages/OAuth2Onboarding'))
const FindPassword = lazy(() => import('./pages/FindPassword'))
const ChangePassword = lazy(() => import('./pages/ChangePassword'))
const ShortsFeed = lazy(() => import('./pages/ShortsFeed'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))

const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'))
const AdminMembersPage = lazy(() => import('./pages/AdminMembersPage'))
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'))

function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
          로딩 중...
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
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
          <Route path="/gallery" element={<Community mode="gallery" />} />
          <Route path="/shorts" element={<ShortsFeed />} />
          <Route path="/lounge" element={<Community mode="lounge" />} />
          <Route path="/community/create" element={<PostCreate />} />
          <Route path="/community/:id" element={<PostDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  )
}

export default App
