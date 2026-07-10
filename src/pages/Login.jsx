import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authApi } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login({ email, password });
      login(data.accessToken, data.role, data.nickname);
      navigate('/');
    } catch (error) {
      alert(error.message || '로그인에 실패했어요 🥲 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const showDemoNotice = (service) => {
    alert(`[${service} 연동 안내]\n현재 데모 버전입니다. 실제 계정으로 서비스를 이용하시려면 이메일로 로그인해 주세요! 🧪`);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Logo Section */}
        <div className="auth-logo-section">
          <div className="auth-logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <path d="M9 9h.01M15 9h.01" strokeWidth="3" />
            </svg>
          </div>
          <span className="auth-logo-text">SLEEPY</span>
          <span className="auth-logo-sub">Lovely Slime Market Platform</span>
        </div>

        <h2>로그인</h2>
        <form onSubmit={handleLogin} className="auth-form">
          {/* Email Input */}
          <div className="auth-form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-wrapper" style={{ marginTop: '0.6rem' }}>
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input 
                id="email"
                type="email" 
                placeholder="example@sleepy.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="auth-form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper" style={{ marginTop: '0.6rem' }}>
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="비밀번호를 입력하세요" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Social Login Buttons */}
        <div className="social-login-section">
          <div className="social-login-divider">또는 간편 로그인</div>
          <div className="social-buttons">
            <a href="/oauth2/authorization/kakao" className="social-btn kakao" title="카카오 로그인">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 3.185-9 7.11 0 2.507 1.642 4.718 4.14 5.926-.17.6-.613 2.164-.702 2.502-.112.434.156.428.328.314.135-.09 2.146-1.458 3.003-2.04.72.1 1.464.153 2.23.153 4.97 0 9-3.185 9-7.11S16.97 3 12 3z"/>
              </svg>
            </a>
            <a href="/oauth2/authorization/naver" className="social-btn naver" title="네이버 로그인" style={{ backgroundColor: '#03C75A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '40px', height: '40px', textDecoration: 'none' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Arial' }}>N</span>
            </a>
          </div>
        </div>

        <p className="auth-link">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  )
}

