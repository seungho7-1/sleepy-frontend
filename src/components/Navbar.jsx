import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function Navbar() {
  const { token, role, nickname, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header>
      <div className="logo-text">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>SLIME MARKET</Link>
      </div>
      <div className="nav-links">
        <Link to="/community" className="nav-btn">커뮤니티</Link>
        {token ? (
          <>
            <span className="welcome-text">{nickname}님</span>
            <Link to="/mypage" className="nav-btn">마이페이지</Link>
            {role === 'SELLER' && <Link to="/seller" className="nav-btn admin-btn">판매자 센터</Link>}
            {role === 'ADMIN' && <Link to="/admin" className="nav-btn admin-btn">관리자</Link>}
            <button onClick={handleLogout} className="nav-btn logout-btn">로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn">로그인</Link>
            <Link to="/signup" className="nav-btn">회원가입</Link>
          </>
        )}
      </div>
    </header>
  )
}
