import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Camera, House, LogOut, UserRound, Bell, LayoutDashboard, Store } from 'lucide-react';
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

  // 안 읽은 알림 개수 주기적 조회 (혹은 마운트 시 1회) -> Firebase 실시간 연동
  useEffect(() => {
    if (token && nickname) {
      const q = query(
        collection(db, "notifications", nickname, "userNotifications"),
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
        {/* 모바일 햄버거 메뉴 버튼 */}
        <button 
          className="hamburger-btn" 
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
        >
          ☰
        </button>

        {/* 브랜드 로고 */}
        <div className="logo-text">
          <Link to="/" className="brand-logo">
            <span className="bubble-icon">🫧</span>
            <span className="brand-name">Sleepy</span>
          </Link>
        </div>

        {/* 모바일용 알림 버튼 (900px 이하에서만 표시) */}
        {token && (
          <div className="mobile-notification-wrapper">
            <button 
              className="nav-btn notification-btn" 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell size={22} strokeWidth={2.2} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {isNotificationOpen && <NotificationDropdown onClose={(wasRead) => { 
              setIsNotificationOpen(false); 
              if (wasRead) fetchUnreadCount(); 
            }} />}
          </div>
        )}

        {/* 데스크톱 네비게이션 링크 */}
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-btn ${isActive('/') ? 'active' : ''}`}
          >
            <House size={18} strokeWidth={2.2} />마켓홈
          </Link>
          <Link 
            to="/gallery" 
            className={`nav-btn ${isActive('/gallery') ? 'active' : ''}`}
          >
            <Camera size={18} strokeWidth={2.2} />슬라임 갤러리
          </Link>
          <Link 
            to="/lounge" 
            className={`nav-btn ${isActive('/lounge') ? 'active' : ''}`}
          >
            Q&A 라운지
          </Link>
          <Link 
            to="/notice" 
            className={`nav-btn ${isActive('/notice') ? 'active' : ''}`}
          >
            이용 가이드
          </Link>
          
          <div className="nav-divider">|</div>

          {token ? (
            <div className="user-nav-actions">
              <span className="welcome-badge">
                <span className="dot"></span>
                {nickname}님
              </span>
              
              <div className="notification-wrapper" style={{ position: 'relative' }}>
                <button 
                  className="nav-btn notification-btn" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={20} strokeWidth={2.2} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>
                {isNotificationOpen && <NotificationDropdown onClose={(wasRead) => { 
                  setIsNotificationOpen(false); 
                  if (wasRead) fetchUnreadCount(); 
                }} />}
              </div>

              <Link 
                to="/mypage" 
                className={`nav-btn mypage-btn ${isActive('/mypage') ? 'active' : ''}`}
              >
                마이페이지
              </Link>
              {role === 'SELLER' && (
                <Link to="/seller" className="nav-btn admin-badge seller">
                  판매자 센터
                </Link>
              )}
              {role === 'ADMIN' && (
                <Link to="/admin" className="nav-btn admin-badge admin">
                  관리자
                </Link>
              )}
              <button onClick={handleLogout} className="nav-btn logout-btn">
                <LogOut size={16} strokeWidth={2.5} />
                로그아웃
              </button>
            </div>
          ) : (
            <div className="auth-nav-actions">
              <Link to="/login" className="nav-btn login-btn">
                로그인
              </Link>
              <Link to="/signup" className="nav-btn signup-btn">
                회원가입
              </Link>
            </div>
          )}
        </nav>
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
          <Link to="/" className="brand-logo" onClick={() => setIsDrawerOpen(false)}>
            <span className="bubble-icon">🫧</span>
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
            마켓 홈
          </Link>
          
          {/* 상품 카테고리 목록 (드로어 내부 아코디언) */}
          <div className="drawer-accordion">
            <button 
              className="accordion-header" 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <span>마켓 카테고리</span>
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
            Q&A 라운지
          </Link>
          <Link to="/notice" className={`drawer-menu-item ${isActive('/notice') ? 'active' : ''}`} onClick={() => setIsDrawerOpen(false)}>
            이용 가이드
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
