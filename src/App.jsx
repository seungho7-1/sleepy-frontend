import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyPage from './pages/MyPage'
import SellerDashboard from './pages/SellerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Community from './pages/Community'
import PostDetail from './pages/PostDetail'
import PostCreate from './pages/PostCreate'

import SellerApplyPage from './pages/SellerApplyPage'
import AdminApprovalPage from './pages/AdminApprovalPage'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/apply" element={<SellerApplyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApprovalPage />} />
        <Route path="/gallery" element={<Community mode="gallery" />} />
        <Route path="/lounge" element={<Community mode="lounge" />} />
        <Route path="/community/create" element={<PostCreate />} />
        <Route path="/community/:id" element={<PostDetail />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
