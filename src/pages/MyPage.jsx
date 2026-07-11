import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'
import { sellerApi } from '../api/seller'
import { authApi } from '../api/auth'
import ProductCard from '../components/ProductCard'
import { formatDate } from '../utils/formatDate'

export default function MyPage() {
  const { token, role, nickname, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [myComments, setMyComments] = useState([])
  const [myMedia, setMyMedia] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [application, setApplication] = useState(null)

  useEffect(() => {
    if (!token) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }
    
    // Load all user content counts on mount
    fetchProfile()
    fetchWishlist()
    fetchMyPosts()
    fetchMyComments()
    fetchMyMedia()
    fetchApplicationStatus()
  }, [token])

  const fetchProfile = async () => {
    try {
      const data = await authApi.me()
      setProfile(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchApplicationStatus = async () => {
    try {
      const data = await sellerApi.getLatest()
      if (data && data.status) {
        setApplication(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchWishlist = async () => {
    try {
      const data = await productApi.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    }
  }

  const fetchMyPosts = async () => {
    try {
      const data = await boardApi.getMyPosts('TEXT');
      setMyPosts(data);
    } catch (err) {
      console.error(err);
    }
  }

  const fetchMyComments = async () => {
    try {
      const data = await boardApi.getMyComments();
      setMyComments(data);
    } catch (err) {
      console.error(err);
    }
  }

  const fetchMyMedia = async () => {
    try {
      const data = await boardApi.getMyPosts('MEDIA');
      setMyMedia(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleWithdraw = async () => {
    const confirmWithdraw = window.confirm(
      '정말로 회원 탈퇴를 진행하시겠습니까?\n계정과 등록된 모든 정보가 영구 삭제되며 소셜 로그인 연동이 해제됩니다.'
    )
    if (!confirmWithdraw) return;
    
    try {
      await authApi.withdraw()
      alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.')
      logout()
      navigate('/')
    } catch (err) {
      alert(err.message || '탈퇴 처리 중 오류가 발생했습니다.')
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
              {(role === 'USER' || role === 'BUYER') ? '일반 구매자' : role === 'SELLER' ? '슬라임 판매자' : '관리자'}
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
          <button 
            className={`mypage-nav-btn ${activeTab === 'my-posts' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my-posts')}
          >
            내가 쓴 글 ({myPosts.length})
          </button>
          <button 
            className={`mypage-nav-btn ${activeTab === 'my-comments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my-comments')}
          >
            내가 쓴 댓글 ({myComments.length})
          </button>
          <button 
            className={`mypage-nav-btn ${activeTab === 'my-media' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my-media')}
          >
            내 사진/영상 ({myMedia.length})
          </button>
          {(role === 'USER' || role === 'BUYER') && (
            <>
              {(!application || application.status === 'REJECTED') && (
                <button className="mypage-nav-btn" onClick={() => navigate('/seller/apply')}>
                  {application?.status === 'REJECTED' ? '판매자 다시 신청하기' : '판매자 신청하기'}
                </button>
              )}
              {application?.status === 'PENDING' && (
                <button className="mypage-nav-btn pending-btn" disabled style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }}>
                  ⏳ 판매자 신청 (대기 중)
                </button>
              )}
            </>
          )}
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
                  <span className="detail-label">아이디 계정</span>
                  <span className="detail-value">{profile?.username || '-'}</span>
                </div>
                <div className="detail-item" style={{ marginTop: '0.8rem' }}>
                  <span className="detail-label">이메일 주소</span>
                  <span className="detail-value">{profile?.email || '등록된 이메일이 없습니다.'}</span>
                </div>
                <div className="detail-item" style={{ marginTop: '0.8rem' }}>
                  <span className="detail-label">닉네임</span>
                  <span className="detail-value">{profile?.nickname || '-'}</span>
                </div>
                <div className="detail-item" style={{ marginTop: '0.8rem' }}>
                  <span className="detail-label">계정 등급</span>
                  <span className="detail-value">{(role === 'USER' || role === 'BUYER') ? '일반 회원' : role === 'SELLER' ? '판매자 회원' : '관리자'}</span>
                </div>
                {application && (role === 'USER' || role === 'BUYER') && (
                  <div className="detail-item seller-status-item" style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                    <span className="detail-label">판매자 신청 상태</span>
                    <span className="detail-value" style={{ 
                      fontWeight: 'bold', 
                      color: application.status === 'PENDING' ? '#d97706' : application.status === 'REJECTED' ? '#ef4444' : '#10b981'
                    }}>
                      {application.status === 'PENDING' ? '⏳ 심사 대기 중' : application.status === 'REJECTED' ? '❌ 반려됨' : '✅ 승인됨'}
                    </span>
                  </div>
                )}
                {application?.status === 'REJECTED' && (role === 'USER' || role === 'BUYER') && (
                  <div className="rejection-reason-container" style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1rem', marginTop: '0.8rem' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem' }}>반려 사유</div>
                    <div style={{ color: '#991b1b', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {application.rejectionReason || '사유가 기재되지 않았습니다.'}
                    </div>
                  </div>
                )}
                
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleWithdraw}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#ef4444', 
                      border: '1px solid #fee2e2', 
                      padding: '0.6rem 1.2rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    회원 탈퇴
                  </button>
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

          {activeTab === 'my-posts' && (
            <div className="glass-card fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>내가 쓴 글</h3>
              {myPosts.length === 0 ? (
                <div className="empty-state">작성한 게시글이 없습니다.</div>
              ) : (
                <div className="my-posts-list">
                  {myPosts.map(post => (
                    <div key={post.id} className="my-post-item-row">
                      <div className="my-post-info">
                        <span className="my-post-tag">
                          {post.boardType === 'FREE' ? '자유' : post.boardType === 'QNA' ? '질문' : post.boardType === 'NOTICE' ? '공지' : '기타'}
                        </span>
                        <Link to={`/community/${post.id}`} className="my-post-title-link">
                          {post.title}
                        </Link>
                      </div>
                      <div className="my-post-meta">
                        <span>좋아요 {post.likeCount}</span>
                        <span>조회 {post.viewCount}</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-comments' && (
            <div className="glass-card fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>내가 쓴 댓글</h3>
              {myComments.length === 0 ? (
                <div className="empty-state">작성한 댓글이 없습니다.</div>
              ) : (
                <div className="my-comments-list">
                  {myComments.map(comment => (
                    <div key={comment.id} className="my-comment-item-row">
                      <div className="my-comment-text">"{comment.content}"</div>
                      <div className="my-comment-origin">
                        {comment.targetType === 'POST' ? (
                          <span>원문: <Link to={`/community/${comment.targetId}`}>{comment.targetTitle}</Link></span>
                        ) : (
                          <span>원문: <Link to={`/product/${comment.targetId}`}>{comment.targetTitle}</Link></span>
                        )}
                        <span className="my-comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-media' && (
            <div className="glass-card fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>내 사진/영상</h3>
              {myMedia.length === 0 ? (
                <div className="empty-state">등록한 사진이나 영상이 없습니다.</div>
              ) : (
                <div className="my-media-grid">
                  {myMedia.map(post => (
                    <Link key={post.id} to={`/community/${post.id}`} className="my-media-card">
                      <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'} alt={post.title} />
                      <div className="my-media-overlay">
                        <span className="my-media-title">{post.title}</span>
                      </div>
                    </Link>
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
