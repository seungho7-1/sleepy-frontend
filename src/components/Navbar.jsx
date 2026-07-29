import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Camera, House, LogOut, UserRound, Bell, LayoutDashboard, Store, Menu, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { notificationApi } from '../api/notification';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Avatar from './Avatar';

import { authApi } from '../api/auth'

export default function Navbar() {
  const { token, role, nickname, profileImageUrl, setProfileImageUrl, setRole, setNickname, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true) // 기본으로 카테고리 아코디언 열어둠
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // If user navigates to /?search=xxx, we could sync it here, but keeping it simple is fine.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('search')) {
      setSearchQuery(params.get('search'))
    } else {
      setSearchQuery('')
    }
  }, [location.search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate(`/`)
    }
  }

  // 안 읽은 알림 개수 주기적 조회 (혹은 마운트 시 1회) -> Firebase 실시간 연동
  useEffect(() => {
    if (token && nickname) {
      const envPrefix = import.meta.env.MODE === 'development' ? 'dev_' : '';
      const q = query(
        collection(db, `${envPrefix}notifications`, nickname, "userNotifications"),
        where("isRead", "==", false)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      });
      return () => unsubscribe();
    } else {
      setUnreadCount(0);
    }
  }, [token, nickname]);

  const handleLogout = () => {
    logout()
    setIsDrawerOpen(false)
    navigate('/')
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.unreadCount !== undefined ? res.unreadCount : res);
    } catch (err) {
      console.error(err);
    }
  };

  // 페이지 이동 시 드로어 자동 닫기
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location])

  // 로그인 시 프로필 및 권한 정보 최신화
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const data = await authApi.me()
          if (data) {
            if (data.profileImageUrl) setProfileImageUrl(data.profileImageUrl)
            if (data.role) setRole(data.role)
            if (data.nickname) setNickname(data.nickname)
          }
        } catch (err) {
          console.error('사용자 정보 로드 실패:', err)
        }
      }
    }
    fetchProfile()
  }, [token, setProfileImageUrl, setRole, setNickname])

  const isActive = (path) => {
    return location.pathname === path
  }

  const categories = ['전체', '슬라임', '슬랑이', '말랑이', '스퀴시']

  // 숏폼 페이지에서는 네비게이션 바 숨김
  if (location.pathname === '/shorts') return null;

  return (
    <>
      <header className="main-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
          
          {/* 모바일 햄버거 메뉴 (900px 이하에서만 표시) */}
          <button 
            className="hamburger-btn" 
            onClick={() => setIsDrawerOpen(true)}
            aria-label="메뉴 열기"
            style={{ padding: '4px', margin: '0 -27px' }}
          >
            <Menu size={28} strokeWidth={2.2} />
          </button>

          {/* 왼쪽: 로고 + 메인 네비게이션 링크 */}
          <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="logo-text">
              <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Sleepy Logo" style={{ height: '32px', marginRight: '8px' }} />
                <span className="brand-name">Sleepy</span>
              </Link>
            </div>

            <nav className="nav-links">
              <Link to="/gallery" className={`nav-btn ${isActive('/gallery') ? 'active' : ''}`}>
                <Camera size={18} strokeWidth={2.2} />슬라임 갤러리
              </Link>
              <Link to="/lounge" className={`nav-btn ${isActive('/lounge') ? 'active' : ''}`}>
                커뮤니티
              </Link>
              <Link to="/notice" className={`nav-btn ${isActive('/notice') ? 'active' : ''}`}>
                공지사항
              </Link>
              <Link to="/support" className={`nav-btn ${isActive('/support') ? 'active' : ''}`}>
                고객센터
              </Link>
            </nav>
          </div>

          {/* 중앙: 글로벌 검색창 제거됨 */}
          <div className="nav-center-search" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', display: 'none' }}>
          </div>

          {/* 오른쪽: 모바일용 알림 버튼 또는 데스크톱 유저 액션 */}
          <div className="nav-right-group" style={{ display: 'flex', alignItems: 'center' }}>
            {/* 모바일 알림 (900px 이하) */}
            {token && (
              <div className="mobile-notification-wrapper">
                <button 
                  className="nav-btn notification-btn" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={22} strokeWidth={2.2} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>
                {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
              </div>
            )}

            {/* 데스크톱 유저 액션 (900px 초과) */}
            <div className="desktop-user-actions">
              {token ? (
                <div className="user-nav-actions">
                  <span className="welcome-badge"><span className="dot"></span>{nickname}님</span>
                  <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <button className="nav-btn notification-btn" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                      <Bell size={20} strokeWidth={2.2} />
                      {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </button>
                    {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
                  </div>
                  <Link to="/mypage" className={`nav-btn mypage-btn ${isActive('/mypage') ? 'active' : ''}`}>마이페이지</Link>
                  {role === 'SELLER' && <Link to="/seller" className="nav-btn admin-badge seller">판매자 센터</Link>}
                  {role === 'ADMIN' && <Link to="/admin" className="nav-btn admin-badge admin">관리자</Link>}
                  <button onClick={handleLogout} className="nav-btn logout-btn"><LogOut size={16} strokeWidth={2.5} />로그아웃</button>
                </div>
              ) : (
                <div className="auth-nav-actions">
                  <Link to="/login" className="nav-btn login-btn">로그인</Link>
                  <Link to="/signup" className="nav-btn signup-btn">회원가입</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 사이드 드로어 메뉴 */}
      {isDrawerOpen && (
        <div 
          className="drawer-backdrop" 
          onClick={() => setIsDrawerOpen(false)} 
        />
      )}
      
      <div className={`drawer-container ${isDrawerOpen ? 'open' : ''}`}>
        {/* 드로어 헤더 */}
        <div className="drawer-header">
          <Link to="/" className="brand-logo" onClick={() => setIsDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Sleepy Logo" style={{ height: '32px', marginRight: '8px' }} />
            <span className="brand-name">Sleepy</span>
          </Link>
          <button 
            className="close-drawer-btn" 
            onClick={() => setIsDrawerOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* 유저 정보 */}
        <div className="drawer-profile-section">
          {token ? (
            <div className="profile-logged-in">
              <div className="profile-avatar" style={{ overflow: 'hidden', border: 'none', background: 'none' }}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <Avatar name={nickname} size={38} />
                )}
              </div>
              <div className="profile-info">
                <div className="profile-nickname">{nickname}</div>
                <div className="profile-welcome">반가워요!</div>
              </div>
            </div>
          ) : (
            <div className="profile-logged-out">
              <p className="login-message">로그인 후 더 많은 서비스를 이용해보세요.</p>
              <div className="drawer-auth-buttons">
                <Link to="/login" className="drawer-btn login">로그인</Link>
                <Link to="/signup" className="drawer-btn signup">회원가입</Link>
              </div>
            </div>
          )}
        </div>

        {/* 메뉴 목록 */}
        <div className="drawer-menu-list">
          <Link to="/" className={`drawer-menu-item ${isActive('/') ? 'active' : ''}`}>
            홈
          </Link>
          
          {/* 상품 카테고리 목록 (드로어 내부 아코디언) */}
          <div className="drawer-accordion">
            <button 
              className="accordion-header" 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <span>카테고리</span>
              <span className={`arrow ${isCategoryOpen ? 'open' : ''}`}>▼</span>
            </button>
            
            {isCategoryOpen && (
              <div className="accordion-content">
                {categories.map((cat) => (
                  <Link 
                    key={cat} 
                    to={`/?category=${cat}`}
                    className="category-sub-item"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-menu-divider" />

          <Link to="/gallery" className={`drawer-menu-item ${isActive('/gallery') ? 'active' : ''}`}>
            슬라임 갤러리
          </Link>
          <Link to="/lounge" className={`drawer-menu-item ${isActive('/lounge') ? 'active' : ''}`}>
            커뮤니티
          </Link>
          
          <div className="drawer-menu-divider" />
          <Link to="/support" className={`drawer-menu-item ${isActive('/support') ? 'active' : ''}`}>
            고객센터
          </Link>
          <Link to="/notice" className={`drawer-menu-item ${isActive('/notice') ? 'active' : ''}`}>
            공지사항
          </Link>
          {token && (
            <Link to="/mypage" className={`drawer-menu-item ${isActive('/mypage') ? 'active' : ''}`}>
              마이페이지
            </Link>
          )}
          
          {(role === 'SELLER' || role === 'ADMIN' || token) && (
            <>
              <div className="drawer-menu-divider" />
              <div className="drawer-quick-links">
                {role === 'SELLER' && (
                  <Link to="/seller" className="drawer-menu-item quick-badge seller">
                    판매자 센터
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link to="/admin" className="drawer-menu-item quick-badge admin">
                    관리자 대시보드
                  </Link>
                )}
                {token && (
                  <button onClick={handleLogout} className="drawer-menu-item logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LogOut size={16} strokeWidth={2.5} />
                     로그아웃
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
