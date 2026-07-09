import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    role: 'BUYER'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
  }

  const handleNextStep = () => {
    if (step === 2) {
      // Basic client-side checks for Step 2
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('올바른 이메일 주소를 입력해 주세요.');
        return;
      }
      if (formData.password.length < 4) {
        alert('비밀번호는 최소 4글자 이상 입력해 주세요.');
        return;
      }
    }
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!formData.nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }
    setLoading(true)
    try {
      await authApi.signup(formData);
      alert('환영합니다! 회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      alert(error.message || '회원가입에 실패했어요 🥲');
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress percentage
  const progressPercent = step === 1 ? 33.3 : step === 2 ? 66.6 : 100;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Progress Bar */}
        <div className="stepper-progress-container">
          <div className="stepper-steps-info">
            <span>회원 정보 입력</span>
            <span>{step}단계 / 3단계</span>
          </div>
          <div className="stepper-progress-bar">
            <div 
              className="stepper-progress-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '0.5rem' }}>환영합니다!</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              어떤 목적으로 서비스를 이용하시나요?
            </p>
            <div className="role-cards-container">
              <div 
                className={`role-card ${formData.role === 'BUYER' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('BUYER')}
              >
                <div className="role-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div className="role-card-title">일반 구매자</div>
                <div className="role-card-desc">사랑스러운 슬라임을 구경하고 주문해요 🌸</div>
              </div>

              <div 
                className={`role-card ${formData.role === 'SELLER' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('SELLER')}
              >
                <div className="role-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="role-card-title">마켓 사장님</div>
                <div className="role-card-desc">슬라임을 등록하고 마켓을 관리해요 🧪</div>
              </div>
            </div>
            <button type="button" className="submit-btn" onClick={handleNextStep}>
              다음 단계로
            </button>
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <div className="fade-in">
            <h2>계정 정보 생성</h2>
            <div className="auth-form">
              {/* Email Input */}
              <div className="auth-form-group">
                <label htmlFor="email">이메일 주소</label>
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
                    name="email"
                    placeholder="이메일을 입력하세요" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    placeholder="4글자 이상 비밀번호" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="stepper-actions">
                <button type="button" className="prev-btn" onClick={handlePrevStep}>이전</button>
                <button 
                  type="button" 
                  className="submit-btn next-btn" 
                  onClick={handleNextStep}
                  disabled={!formData.email || !formData.password}
                >
                  다음 단계로
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Nickname Setup */}
        {step === 3 && (
          <form onSubmit={handleSignup} className="fade-in">
            <h2>닉네임 설정</h2>
            <div className="auth-form">
              <div className="auth-form-group">
                <label htmlFor="nickname">마켓 닉네임</label>
                <div className="input-wrapper" style={{ marginTop: '0.6rem' }}>
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input 
                    id="nickname"
                    type="text" 
                    name="nickname"
                    placeholder="귀여운 닉네임을 적어주세요 (예: 말랑이)" 
                    required 
                    value={formData.nickname}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </div>

              <div className="stepper-actions">
                <button type="button" className="prev-btn" onClick={handlePrevStep} disabled={loading}>이전</button>
                <button 
                  type="submit" 
                  className="submit-btn next-btn" 
                  disabled={!formData.nickname || loading}
                >
                  {loading ? '가입 진행 중...' : '가입 완료하기'}
                </button>
              </div>
            </div>
          </form>
        )}

        <p className="auth-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
