import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { authApi } from '../../api/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import logoImg from '../../assets/logo_3.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const role = params.get('role')
    const nickname = params.get('nickname')
    if (token) {
      login(token, role, nickname)
      navigate('/')
    }
  }, [location, login, navigate])

  const getBackendUrl = () => {
    return window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'http://slippy.kr';
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login({ username, password });
      login(data.accessToken, data.role, data.nickname);
      navigate('/');
    } catch (error) {
      alert(error.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const showDemoNotice = (service) => {
    alert(`[${service} 연동 안내]\n현재 데모 버전입니다. 실제 계정으로 서비스를 이용하시려면 아이디로 로그인해 주세요!`);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Logo Section */}
        <div className="auth-logo-section" style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={logoImg} alt="Sleepy Logo" style={{ height: '180px', objectFit: 'contain' }} />
          <span className="auth-logo-sub">나만의 슬라임 찾는 방법</span>

        </div>

        <h2>로그인</h2>
        <form onSubmit={handleLogin} className="auth-form">
          {/* Username Input */}
          <div className="auth-form-group">
            <label htmlFor="username">아이디</label>
            <div className="input-wrapper" style={{ marginTop: '0.6rem' }}>
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                id="username"
                type="text" 
                placeholder="아이디를 입력하세요" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="auth-form-group">
            <label htmlFor="password">비밀번호</label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: '0.6rem' }}
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
            <Link to="/find-password" style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textDecoration: 'none' }}>비밀번호를 잊으셨나요?</Link>
          </div>

          <Button type="submit" isLoading={loading} style={{ marginTop: '0.8rem' }}>
            로그인
          </Button>
        </form>

        {/* Social Login Buttons */}
        <div className="social-login-section">
          <div className="social-login-divider">또는 간편 로그인</div>
          <div className="social-buttons">
            <a href={`${getBackendUrl()}/oauth2/authorization/kakao`} className="social-btn kakao" title="카카오 로그인">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 3.185-9 7.11 0 2.507 1.642 4.718 4.14 5.926-.17.6-.613 2.164-.702 2.502-.112.434.156.428.328.314.135-.09 2.146-1.458 3.003-2.04.72.1 1.464.153 2.23.153 4.97 0 9-3.185 9-7.11S16.97 3 12 3z"/>
              </svg>
            </a>
            <a href={`${getBackendUrl()}/oauth2/authorization/naver`} className="social-btn naver" title="네이버 로그인" style={{ textDecoration: 'none' }}>
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

