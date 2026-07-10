import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'

export default function Navbar() {
  const { token, role, nickname, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true) // 기본으로 카테고리 아코디언 열어둠

  const handleLogout = () => {
    logout()
    setIsDrawerOpen(false)
    navigate('/')
  }

  // 페이지 이동 시 드로어 자동 닫기
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location])

  const isActive = (path) => {
    return location.pathname === path
  }

  const categories = ['전체', '크런키', '클리어', '샤베트', '버터']

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

        {/* 데스크톱 네비게이션 링크 */}
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-btn ${isActive('/') ? 'active' : ''}`}
          >
            🏠 쇼핑홈
          </Link>
          <Link 
            to="/gallery" 
            className={`nav-btn ${isActive('/gallery') ? 'active' : ''}`}
          >
            ✨ 슬라임 갤러리
          </Link>
          <Link 
            to="/lounge" 
            className={`nav-btn ${isActive('/lounge') ? 'active' : ''}`}
          >
            💬 Q&A 라운지
          </Link>
          
          <div className="nav-divider">|</div>

          {token ? (
            <div className="user-nav-actions">
              <span className="welcome-badge">
                <span className="dot"></span>
                {nickname}님
              </span>
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

        {/* 유저 정보 (오늘의집 모바일 버전처럼 가볍고 심플하게) */}
        <div className="drawer-profile-section">
          {token ? (
            <div className="profile-logged-in">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <div className="profile-nickname">{nickname}</div>
                <div className="profile-welcome">반가워요! 🫧</div>
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
            쇼핑 홈
          </Link>
          
          {/* 상품 카테고리 목록 (드로어 내부 아코디언) */}
          <div className="drawer-accordion">
            <button 
              className="accordion-header" 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <span>쇼핑 카테고리</span>
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
                    {cat} 슬라임
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
                  <button onClick={handleLogout} className="drawer-menu-item logout-btn">
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
