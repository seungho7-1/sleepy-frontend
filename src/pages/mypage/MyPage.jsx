import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore } from '../../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../../api/products'
import { boardApi } from '../../api/board'
import { sellerApi } from '../../api/seller'
import { authApi } from '../../api/auth'
import { notificationApi } from '../../api/notification'
import ProductCard from '../../components/ProductCard'
import { formatDate } from '../../utils/formatDate'
import { useLocation } from 'react-router-dom'

export default function MyPage() {
  const { token, role, nickname, setProfileImageUrl, setRole, setNickname, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [profile, setProfile] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [myComments, setMyComments] = useState([])
  const [myMedia, setMyMedia] = useState([])
  const [myNotifications, setMyNotifications] = useState([])
  const [notifPage, setNotifPage] = useState(1)
  const [activeTab, setActiveTab] = useState('profile')
  const [application, setApplication] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({ nickname: '', email: '', profileImageUrl: '' })
  const [uploadingProfileImg, setUploadingProfileImg] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)

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
    fetchMyNotifications()
    
    // URL 파라미터에서 탭 확인 (예: ?tab=notifications)
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [token, location.search])

  const fetchProfile = async () => {
    try {
      const data = await authApi.me()
      setProfile(data)
      setEditFormData({
        nickname: data.nickname || '',
        email: data.email || '',
        profileImageUrl: data.profileImageUrl || ''
      })
      if (data.profileImageUrl) {
        setProfileImageUrl(data.profileImageUrl)
      }
      if (data.role) {
        setRole(data.role)
      }
      if (data.nickname) {
        setNickname(data.nickname)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData({
      nickname: profile.nickname || '',
      email: profile.email || '',
      profileImageUrl: profile.profileImageUrl || ''
    })
  }

  const handleSaveProfile = async () => {
    try {
      await authApi.updateProfile(editFormData)
      alert('프로필이 업데이트되었습니다.')
      setIsEditing(false)
      fetchProfile()
    } catch (err) {
      alert('프로필 수정 중 오류가 발생했습니다.')
    }
  }

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingProfileImg(true)
      const res = await boardApi.uploadFile(file, 'profile')
      const updatedProfile = { 
        nickname: profile.nickname, 
        email: profile.email, 
        profileImageUrl: res.url 
      }
      await authApi.updateProfile(updatedProfile)
      setProfile(prev => ({ ...prev, profileImageUrl: res.url }))
      setProfileImageUrl(res.url)
      alert('프로필 사진이 변경되었습니다.')
    } catch (err) {
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingProfileImg(false)
    }
  }

  const handleProfileImageDelete = async () => {
    if (!window.confirm('프로필 사진을 삭제하시겠습니까?')) return
    try {
      setUploadingProfileImg(true)
      const updatedProfile = { 
        nickname: profile.nickname, 
        email: profile.email, 
        profileImageUrl: '' 
      }
      await authApi.updateProfile(updatedProfile)
      setProfile(prev => ({ ...prev, profileImageUrl: null }))
      setProfileImageUrl(null)
      alert('프로필 사진이 삭제되었습니다.')
    } catch (err) {
      alert('프로필 사진 삭제에 실패했습니다.')
    } finally {
      setUploadingProfileImg(false)
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

  const fetchMyNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      // data might be wrapped in res.data depending on axios setup, assuming res is the array
      setMyNotifications(res.data || res);
    } catch (err) {
      console.error(err);
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
          <div className="profile-avatar-container" style={{ position: 'relative', display: 'inline-block', width: '80px', height: '80px', margin: '0 auto' }}>
            <div className="profile-avatar" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '2rem', fontWeight: 'bold' }}>
              {profile?.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                nickname ? nickname.charAt(0).toUpperCase() : 'U'
              )}
              {uploadingProfileImg && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid var(--primary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                </div>
              )}
            </div>
            
            {/* FB Style Camera Icon Button */}
            <button 
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              style={{ position: 'absolute', bottom: '0', right: '0', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e4e6eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#050505' }}
              title="프로필 사진 관리"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><path d="M21 5.5H17.8L16.4 3.3C16.1 2.8 15.6 2.5 15 2.5H9C8.4 2.5 7.9 2.8 7.6 3.3L6.2 5.5H3C1.9 5.5 1 6.4 1 7.5v12C1 20.6 1.9 21.5 3 21.5h18c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zM21 19.5H3v-12h4l1.4-2.2c.1-.1.2-.2.4-.2h6.4c.2 0 .3.1.4.2L17 7.5h4v12z"/></svg>
            </button>

            {/* Centered Modal Menu */}
            {isAvatarMenuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, animation: 'fadeIn 0.2s ease' }} onClick={() => setIsAvatarMenuOpen(false)}></div>
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '1.2rem', zIndex: 1001, minWidth: '280px', animation: 'scaleIn 0.2s ease', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>프로필 사진 관리</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', color: '#111', fontSize: '0.95rem', fontWeight: '600', backgroundColor: '#f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e5e7eb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      사진 업로드
                      <input type="file" accept="image/*" onChange={(e) => { setIsAvatarMenuOpen(false); handleProfileImageUpload(e); }} style={{ display: 'none' }} disabled={uploadingProfileImg} />
                    </label>
                    
                    {profile?.profileImageUrl && (
                      <button onClick={() => { setIsAvatarMenuOpen(false); handleProfileImageDelete(); }} disabled={uploadingProfileImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', color: '#ef4444', fontSize: '0.95rem', fontWeight: '600', width: '100%', border: 'none', backgroundColor: '#fef2f2', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        현재 사진 삭제
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
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
            찜한 상품 ({wishlist.length})
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
          <button 
            className={`mypage-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} 
            onClick={() => setActiveTab('notifications')}
          >
            내 알림 내역 ({myNotifications.length})
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>프로필 상세</h3>
                {!isEditing ? (
                  <button onClick={handleEditProfile} className="nav-btn" style={{ padding: '4px 12px' }}>프로필 수정</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCancelEdit} className="nav-btn" style={{ padding: '4px 12px', background: '#eee', color: '#333' }}>취소</button>
                    <button onClick={handleSaveProfile} className="nav-btn" style={{ padding: '4px 12px', background: 'var(--primary-color)', color: '#fff' }}>저장</button>
                  </div>
                )}
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">아이디 계정</span>
                  <span className="detail-value">{profile?.username || '-'}</span>
                </div>

                <div className="detail-item" style={{ marginTop: '0.8rem' }}>
                  <span className="detail-label">이메일 주소</span>
                  {isEditing ? (
                    <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.85rem' }} placeholder="이메일 입력" />
                  ) : (
                    <span className="detail-value">{profile?.email || '등록된 이메일이 없습니다.'}</span>
                  )}
                </div>
                <div className="detail-item" style={{ marginTop: '0.8rem' }}>
                  <span className="detail-label">닉네임</span>
                  {isEditing ? (
                    <input type="text" value={editFormData.nickname} onChange={e => setEditFormData({...editFormData, nickname: e.target.value})} style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.85rem' }} placeholder="닉네임 입력" />
                  ) : (
                    <span className="detail-value">{profile?.nickname || '-'}</span>
                  )}
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
                {application?.status === 'APPROVED' && (role === 'USER' || role === 'BUYER') && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.8rem 0', color: '#166534', fontSize: '0.85rem', fontWeight: 'bold' }}>🎉 판매자 승인이 완료되었습니다!</p>
                    <p style={{ margin: '0 0 0.8rem 0', color: '#15803d', fontSize: '0.8rem', lineHeight: '1.4' }}>권한을 업데이트하고 판매자 센터로 이동하려면 다시 로그인해주세요.</p>
                    <button 
                      onClick={() => { 
                        useAuthStore.getState().logout();
                        navigate('/login');
                      }}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      다시 로그인하기
                    </button>
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
                
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  {!profile?.oauthProvider && (
                    <button 
                      onClick={() => navigate('/change-password')}
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: 'var(--text-main)', 
                        border: '1px solid var(--border-color)', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      비밀번호 변경
                    </button>
                  )}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-color)' }}>찜한 상품</h3>
              
              {wishlist.length === 0 ? (
                <div className="empty-state glass-card">
                  내가 찜한 슬라임이 없습니다.
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
          
          {activeTab === 'notifications' && (() => {
            const NOTIF_PER_PAGE = 10;
            const totalNotifPages = Math.ceil(myNotifications.length / NOTIF_PER_PAGE) || 1;
            const currentNotifs = myNotifications.slice((notifPage - 1) * NOTIF_PER_PAGE, notifPage * NOTIF_PER_PAGE);
            
            return (
              <div className="glass-card fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>내 알림 내역</h3>
                  {myNotifications.some(n => !n.read) && (
                    <button 
                      onClick={async () => {
                        try {
                          await notificationApi.markAllAsRead();
                        } catch(e) {
                          console.error("Backend DB markAllAsRead failed, continuing to Firebase sync...", e);
                        }
                        
                        try {
                          // 파이어베이스 싱크 강제 처리
                          const unreadNotifs = myNotifications.filter(n => !n.read);
                          for (const notif of unreadNotifs) {
                            try {
                              await notificationApi.markAsRead(notif.id);
                            } catch (err) {
                              console.error(err);
                            }
                            try {
                              const docRef = doc(db, "notifications", profile.nickname, "userNotifications", String(notif.id));
                              await updateDoc(docRef, { isRead: true });
                            } catch (fbErr) {
                              console.error("Firebase direct update failed", fbErr);
                            }
                          }
                          
                          fetchMyNotifications(); // 읽음 상태 갱신
                        } catch(e) {
                          console.error("Firebase sync failed", e);
                        }
                      }}
                      className="nav-btn" style={{ padding: '4px 12px' }}
                    >
                      모두 읽음 처리
                    </button>
                  )}
                </div>
                
                {myNotifications.length === 0 ? (
                  <div className="empty-state">알림 내역이 없습니다.</div>
                ) : (
                  <>
                    <div className="my-notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {currentNotifs.map(notif => (
                        <div key={notif.id} className="notification-history-item" style={{ 
                          padding: '1rem', 
                          borderRadius: '8px', 
                          backgroundColor: notif.read ? 'var(--bg-secondary)' : '#fff0f2',
                          border: '1px solid',
                          borderColor: notif.read ? 'var(--border-color)' : '#ffccd8',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {notif.type === 'NEW_COMMENT' ? '💬' : 
                                 notif.type === 'NEW_LIKE' ? '❤️' : 
                                 notif.type === 'NEW_REVIEW' ? '⭐' : 
                                 notif.type === 'WISHLIST_UPDATE' ? '🛍️' : 
                                 notif.type === 'SELLER_APPROVAL' ? '✅' : 
                                 notif.type === 'SELLER_REJECTED' ? '❌' : '🔔'}
                              </span>
                              <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                                {notif.message}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                          
                          {notif.relatedUrl && (
                            <div style={{ paddingLeft: '2rem', marginTop: '0.2rem' }}>
                              <button 
                                onClick={() => {
                                  if (!notif.read) {
                                    notificationApi.markAsRead(notif.id).catch(console.error);
                                  }
                                  let finalUrl = notif.relatedUrl;
                                  if (finalUrl === '/admin/sellers') finalUrl = '/admin/applications';
                                  if (finalUrl === '/my/seller-status') finalUrl = '/mypage';
                                  navigate(finalUrl);
                                }}
                                style={{ 
                                  background: 'none', border: 'none', padding: 0, 
                                  color: 'var(--primary-color)', fontSize: '0.85rem', 
                                  cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' 
                                }}
                              >
                                바로가기 ➔
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalNotifPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <button 
                          onClick={() => setNotifPage(prev => Math.max(prev - 1, 1))}
                          disabled={notifPage === 1}
                          style={{ 
                            padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: notifPage === 1 ? 'not-allowed' : 'pointer', opacity: notifPage === 1 ? 0.5 : 1 
                          }}
                        >
                          이전
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          {Array.from({ length: totalNotifPages }, (_, i) => i + 1).map(pageNum => (
                            <button
                              key={pageNum}
                              onClick={() => setNotifPage(pageNum)}
                              style={{
                                padding: '6px 12px', 
                                border: '1px solid', 
                                borderColor: notifPage === pageNum ? 'var(--primary-color)' : '#ddd',
                                borderRadius: '4px', 
                                background: notifPage === pageNum ? 'var(--primary-color)' : 'white',
                                color: notifPage === pageNum ? 'white' : 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: notifPage === pageNum ? 'bold' : 'normal'
                              }}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => setNotifPage(prev => Math.min(prev + 1, totalNotifPages))}
                          disabled={notifPage === totalNotifPages}
                          style={{ 
                            padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: notifPage === totalNotifPages ? 'not-allowed' : 'pointer', opacity: notifPage === totalNotifPages ? 0.5 : 1 
                          }}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  )
}
