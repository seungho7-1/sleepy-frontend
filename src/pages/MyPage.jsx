import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../api/products'
import ProductCard from '../components/ProductCard'

export default function MyPage() {
  const { token, role, nickname, email } = useAuthStore()
  const navigate = useNavigate()
  
  const [wishlist, setWishlist] = useState([])
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!token) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }
    if (activeTab === 'wishlist') {
      fetchWishlist()
    }
  }, [token, activeTab])

  const fetchWishlist = async () => {
    try {
      const data = await productApi.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mypage-container">
      {/* 미니멀 프로필 영역 */}
      <div className="mypage-banner">
        <div className="mypage-banner-content">
          <div className="profile-avatar">
            {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info-header">
            <h2>{nickname}님</h2>
            <p className="role-badge">
              {role === 'USER' ? '일반 구매자' : role === 'SELLER' ? '슬라임 판매자' : '관리자'}
            </p>
          </div>
        </div>
      </div>

      <div className="mypage-content-wrapper">
        {/* 사이드 네비게이션 */}
        <div className="mypage-sidebar">
          <button 
            className={`mypage-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            내 프로필 정보
          </button>
          <button 
            className={`mypage-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`} 
            onClick={() => setActiveTab('wishlist')}
          >
            보관함 ({wishlist.length})
          </button>
          {role === 'SELLER' && (
            <button className="mypage-nav-btn" onClick={() => navigate('/seller')}>
              판매자 관리센터
            </button>
          )}
          {role === 'ADMIN' && (
            <button className="mypage-nav-btn" onClick={() => navigate('/admin')}>
              관리자 대시보드
            </button>
          )}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="mypage-main-content">
          {activeTab === 'profile' && (
            <div className="glass-card fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem' }}>프로필 상세</h3>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">이메일 계정</span>
                  <span className="detail-value">{email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">닉네임</span>
                  <span className="detail-value">{nickname}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">계정 등급</span>
                  <span className="detail-value">{role === 'USER' ? '일반 회원' : role === 'SELLER' ? '판매자 회원' : '관리자'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-color)' }}>보관함 상품</h3>
              
              {wishlist.length === 0 ? (
                <div className="empty-state glass-card">
                  보관함에 저장된 슬라임이 없습니다.
                </div>
              ) : (
                <div className="product-grid">
                  {wishlist.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
