import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import './BottomNav.css';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { role } = useAuthStore();

  return (
    <div className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="icon">🏠</span>
        <span className="label">피드</span>
      </Link>
      <Link to="/community" className={`bottom-nav-item ${pathname.includes('/community') ? 'active' : ''}`}>
        <span className="icon">✨</span>
        <span className="label">자랑하기</span>
      </Link>
      {role === 'SELLER' && (
        <Link to="/seller" className={`bottom-nav-item ${pathname.includes('/seller') ? 'active' : ''}`}>
          <span className="icon">🛍️</span>
          <span className="label">내 스토어</span>
        </Link>
      )}
      <Link to="/mypage" className={`bottom-nav-item ${pathname.includes('/mypage') ? 'active' : ''}`}>
        <span className="icon">👤</span>
        <span className="label">프로필</span>
      </Link>
    </div>
  );
}
