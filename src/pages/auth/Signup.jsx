import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { sellerApi } from '../../api/seller'
import { useAuthStore } from '../../store'
import logoImg from '../../assets/logo_3.png'

// URL에서 SNS 플랫폼 아이콘 자동 감지
function getSnsIcon(url) {
  if (!url) return <svg viewBox="0 0 24 24" width="18" height="18" stroke="#aaa" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  const lower = url.toLowerCase()
  if (lower.includes('youtube.com') || lower.includes('youtu.be'))
    return <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF0000"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/></svg>
  if (lower.includes('instagram.com'))
    return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E1306C" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  if (lower.includes('facebook.com') || lower.includes('fb.com'))
    return <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  if (lower.includes('tiktok.com'))
    return <svg viewBox="0 0 24 24" width="18" height="18" stroke="#000" strokeWidth="2" fill="none"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
  if (lower.includes('twitter.com') || lower.includes('x.com'))
    return <svg viewBox="0 0 24 24" width="18" height="18" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  return <svg viewBox="0 0 24 24" width="18" height="18" stroke="#888" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}

export default function Signup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    role: 'BUYER'
  })
  const [sellerInfo, setSellerInfo] = useState({
    shopName: '',
    shopUrl: '',
    snsUrls: [''],
    introduction: '',
    businessNumber: '',
    repName: '',
    startDate: ''
  })
  const [isBusinessVerified, setIsBusinessVerified] = useState(false)
  const [isVerifyingBusiness, setIsVerifyingBusiness] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUsernameChecked, setIsUsernameChecked] = useState(false)
  const [isEmailChecked, setIsEmailChecked] = useState(false)
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [isOver14, setIsOver14] = useState(false)
  
  // Validation state
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()

  const getBackendUrl = () => {
    return window.location.hostname === 'localhost' ? 'http://localhost:8383' : 'https://api.sleepyslime.p-e.kr';
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'username') {
      setIsUsernameChecked(false)
      if (value.length > 0 && !/^[a-zA-Z0-9]+$/.test(value)) {
        setUsernameError('영문과 숫자만 사용 가능합니다. (한글/특수문자 불가)')
      } else if (value.length > 0 && (value.length < 5 || value.length > 20)) {
        setUsernameError('5자 이상 20자 이하로 입력해 주세요.')
      } else {
        setUsernameError('')
      }
    }
    if (name === 'password') {
      if (value.length > 0 && !/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(value)) {
        setPasswordError('영문, 숫자 포함 8자 이상 입력해주세요.')
      } else {
        setPasswordError('')
      }
    }
    
    if (name === 'email') setIsEmailChecked(false)
    if (name === 'nickname') setIsNicknameChecked(false)
    setFormData({ ...formData, [name]: value })
  }

  const handleSellerChange = (e) => {
    setSellerInfo({ ...sellerInfo, [e.target.name]: e.target.value })
  }

  // SNS URL 다이나믹 리스트
  const handleSnsUrlChange = (index, value) => {
    const next = [...sellerInfo.snsUrls]
    next[index] = value
    setSellerInfo({ ...sellerInfo, snsUrls: next })
  }
  const handleAddSnsUrl = () => {
    if (sellerInfo.snsUrls.length >= 6) return
    setSellerInfo({ ...sellerInfo, snsUrls: [...sellerInfo.snsUrls, ''] })
  }
  const handleRemoveSnsUrl = (index) => {
    const next = sellerInfo.snsUrls.filter((_, i) => i !== index)
    setSellerInfo({ ...sellerInfo, snsUrls: next.length ? next : [''] })
  }

  // URL 패턴으로 SNS 필드 자동 분류
  const classifySnsUrls = (urls) => {
    const filled = urls.filter(u => u.trim())
    const find = (patterns) => filled.find(u => patterns.some(p => u.toLowerCase().includes(p))) || ''
    return {
      youtubeUrl: find(['youtube.com', 'youtu.be']),
      instagramUrl: find(['instagram.com']),
      facebookUrl: find(['facebook.com', 'fb.com']),
      tiktokUrl: find(['tiktok.com']),
    }
  }

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
  }

  const handleCheckUsername = async () => {
    if (usernameError || formData.username.trim().length === 0) {
      alert('아이디 형식을 확인해 주세요.');
      return;
    }
    if (formData.username.trim().length < 5) {
      alert('아이디는 최소 5글자 이상이어야 합니다.');
      return;
    }
    try {
      const response = await authApi.checkUsername(formData.username);
      if (response.exists) {
        alert('이미 사용 중인 아이디입니다.');
        setIsUsernameChecked(false);
      } else {
        alert('사용 가능한 아이디입니다!');
        setIsUsernameChecked(true);
      }
    } catch (err) {
      alert(err.message || '아이디 확인 중 오류가 발생했습니다.');
    }
  }

  const handleCheckEmail = async () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    try {
      const response = await authApi.checkEmail(formData.email);
      if (response.exists) {
        alert('이미 가입된 이메일입니다.');
        setIsEmailChecked(false);
      } else {
        alert('사용 가능한 이메일입니다!');
        setIsEmailChecked(true);
      }
    } catch (err) {
      alert(err.message || '이메일 확인 중 오류가 발생했습니다.');
    }
  }

  const handleCheckNickname = async () => {
    if (formData.nickname.trim().length < 2) {
      alert('닉네임은 최소 2글자 이상이어야 합니다.');
      return;
    }
    try {
      const response = await authApi.checkNickname(formData.nickname);
      if (response.exists) {
        alert('이미 사용 중인 닉네임입니다. 🥲');
        setIsNicknameChecked(false);
      } else {
        alert('사용 가능한 닉네임입니다! 👍');
        setIsNicknameChecked(true);
      }
    } catch (err) {
      alert(err.message || '닉네임 확인 중 오류가 발생했습니다.');
    }
  }

  const handleNextStep = () => {
    if (step === 2) {
      if (formData.username.trim().length < 3) { alert('아이디는 최소 5글자 이상 입력해 주세요.'); return; }
      if (!isUsernameChecked) { alert('아이디 중복 확인을 진행해 주세요.'); return; }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert('올바른 이메일 주소를 필수로 입력해 주세요.'); return; }
      if (!isEmailChecked) { alert('이메일 중복 확인을 진행해 주세요.'); return; }
      if (formData.password.length < 8) { alert('비밀번호는 최소 8글자 이상 입력해 주세요. (보안 정책)'); return; }
      if (passwordError) { alert('비밀번호 형식을 확인해 주세요.'); return; }
      if (formData.password !== confirmPassword) { alert('비밀번호가 일치하지 않습니다.'); return; }
      // 판매자는 닉네임 단계 건너뛰고 바로 step 4로
      if (formData.role === 'SELLER') { setStep(4); return; }
    }
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    // 판매자가 step 4에서 뒤로 가면 step 2로
    if (step === 4 && formData.role === 'SELLER') { setStep(2); return; }
    setStep((prev) => prev - 1)
  }

  const handleSignup = async (e) => {
    if (e) e.preventDefault()
    // 판매자는 shopName을 닉네임으로 사용
    const nickname = formData.role === 'SELLER' ? sellerInfo.shopName : formData.nickname
    if (!nickname.trim()) { alert('닉네임을 입력해 주세요.'); return; }
    if (formData.role !== 'SELLER' && !isNicknameChecked) { alert('닉네임 중복 확인을 진행해 주세요.'); return; }
    if (formData.role === 'SELLER') {
      if (sellerInfo.businessNumber.trim() && !isBusinessVerified) {
        alert('입력하신 사업자등록번호 인증을 완료해 주세요! (또는 빈칸으로 남겨주세요)');
        return;
      }
    }
    setLoading(true)
    try {
      const signupData = {
        ...formData,
        nickname,
        role: 'BUYER'
      }
      await authApi.signup(signupData);

      if (formData.role === 'SELLER') {
        const loginData = await authApi.login({ username: formData.username, password: formData.password });
        useAuthStore.getState().login(loginData.accessToken, loginData.role, loginData.nickname);
        const sns = classifySnsUrls(sellerInfo.snsUrls)
        await sellerApi.apply({
          shopName: sellerInfo.shopName,
          siteUrl: sellerInfo.shopUrl,
          ...sns,
          introduction: sellerInfo.introduction,
          businessNumber: sellerInfo.businessNumber.replace(/-/g, '')
        });
        alert('회원가입 및 판매자 신청이 완료되었습니다! 관리자 승인 후 판매자 센터를 이용하실 수 있습니다.');
        navigate('/');
      } else {
        alert('환영합니다! 회원가입이 완료되었습니다.');
        navigate('/login');
      }
    } catch (error) {
      alert(error.message || '회원가입에 실패했어요');
    } finally {
      setLoading(false)
    }
  }

  // 판매자: step1→step2→step4(3단계), 일반: step1→step2→step3(3단계)
  const totalSteps = 3;
  const visualStep = (formData.role === 'SELLER' && step === 4) ? 3 : step;

  return (
    <div className="auth-container" style={{ minHeight: '85vh', padding: '2rem 1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2.2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="auth-logo-section" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={logoImg} alt="Sleepy Logo" style={{ height: '180px', objectFit: 'contain' }} />
            <span className="auth-logo-sub">회원가입</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.3rem' }}>슬라임 마켓 플랫폼 회원가입</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2.2rem' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isActive = visualStep === idx + 1;
            const isCompleted = visualStep > idx + 1;
            return (
              <div key={idx} style={{ width: isActive ? '28px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: isActive ? 'var(--primary-color)' : isCompleted ? 'rgba(255, 32, 112, 0.4)' : 'var(--border-color)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            )
          })}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '-0.02em' }}>이용 목적을 선택해 주세요</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              
              <div 
                onClick={() => handleRoleSelect('BUYER')}
                style={{ 
                  padding: '1.2rem 1.4rem', 
                  borderRadius: '16px', 
                  border: formData.role === 'BUYER' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: formData.role === 'BUYER' ? '#ffe8f0' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: formData.role === 'BUYER' ? '#fff' : 'var(--bg-secondary)', color: 'var(--primary-color)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>일반 구매자</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>마켓 상품을 탐색하고 후기를 남깁니다.</div>
                </div>
              </div>

              <div 
                onClick={() => handleRoleSelect('SELLER')}
                style={{ 
                  padding: '1.2rem 1.4rem', 
                  borderRadius: '16px', 
                  border: formData.role === 'SELLER' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: formData.role === 'SELLER' ? '#ffe8f0' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: formData.role === 'SELLER' ? '#fff' : 'var(--bg-secondary)', color: 'var(--primary-color)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>마켓 사장님</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>직접 슬라임 샵을 열어 상품을 판매합니다.</div>
                </div>
              </div>

            </div>

            <button type="button" onClick={handleNextStep} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.8rem', transition: 'all 0.2s' }}>
              {formData.role === 'SELLER' ? '판매자로 가입하기' : '일반 회원가입 시작하기'}
            </button>

            {/* Social Login Section */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-sub)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <span>또는 간편하게 가입하기</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              </div>
              <div className="social-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <a href={`${getBackendUrl()}/oauth2/authorization/kakao`} className="social-btn kakao" style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.11 0 2.507 1.642 4.718 4.14 5.926-.17.6-.613 2.164-.702 2.502-.112.434.156.428.328.314.135-.09 2.146-1.458 3.003-2.04.72.1 1.464.153 2.23.153 4.97 0 9-3.185 9-7.11S16.97 3 12 3z"/>
                  </svg>
                </a>
                <a href={`${getBackendUrl()}/oauth2/authorization/naver`} className="social-btn naver" style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  <span style={{ fontWeight: '900', fontSize: '1.1rem', fontFamily: 'Arial', color: '#fff' }}>N</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.02em' }}>로그인 정보 생성</h2>
            <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Username (ID) Input */}
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>아이디 (ID)</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input 
                    type="text" 
                    name="username"
                    placeholder="사용할 아이디" 
                    required 
                    value={formData.username}
                    onChange={handleChange}
                    style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckUsername}
                    style={{ 
                      padding: '0 0.8rem', 
                      borderRadius: '12px', 
                      border: isUsernameChecked ? '1px solid #10b981' : '1px solid var(--primary-color)', 
                      backgroundColor: isUsernameChecked ? '#10b981' : 'transparent', 
                      color: isUsernameChecked ? '#fff' : 'var(--primary-color)', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isUsernameChecked ? '✓ 완료' : '중복 확인'}
                  </button>
                </div>
                {usernameError && <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{usernameError}</div>}
              </div>

              {/* Email Input */}
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>이메일 주소 (필수)</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="이메일을 입력하세요 (필수)" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckEmail}
                    style={{ 
                      padding: '0 0.8rem', 
                      borderRadius: '12px', 
                      border: isEmailChecked ? '1px solid #10b981' : '1px solid var(--primary-color)', 
                      backgroundColor: isEmailChecked ? '#10b981' : 'transparent', 
                      color: isEmailChecked ? '#fff' : 'var(--primary-color)', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isEmailChecked ? '✓ 완료' : '중복 확인'}
                  </button>
                </div>
              </div>

              {/* Password Input */}
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>비밀번호</label>
                <div style={{ position: 'relative', marginTop: '0.4rem' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="최소 8글자 이상 입력하세요" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', fontSize: '0.75rem' }}
                  >
                    {showPassword ? '숨김' : '표시'}
                  </button>
                </div>
                {passwordError && <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{passwordError}</div>}
              </div>

              {/* Confirm Password Input */}
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>비밀번호 확인</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="동일한 비밀번호를 한번 더 입력하세요" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              {/* Terms and Privacy Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: '#111', fontWeight: 'bold', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.8rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isOver14 && agreedTerms && agreedPrivacy}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsOver14(checked);
                      setAgreedTerms(checked);
                      setAgreedPrivacy(checked);
                    }}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer', margin: 0 }}
                  />
                  <span>약관 전체 동의</span>
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>
                    <input 
                      type="checkbox" 
                      checked={isOver14}
                      onChange={(e) => setIsOver14(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer', margin: 0 }}
                    />
                    <span>[필수] 만 14세 이상입니다.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>
                    <input 
                      type="checkbox" 
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer', margin: 0 }}
                    />
                    <span>[필수] <Link to="/terms" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>서비스 이용약관</Link> 동의</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>
                    <input 
                      type="checkbox" 
                      checked={agreedPrivacy}
                      onChange={(e) => setAgreedPrivacy(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer', margin: 0 }}
                    />
                    <span>[필수] <Link to="/privacy" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>개인정보 수집 및 이용</Link> 동의</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
                <button type="button" onClick={handlePrevStep} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-sub)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>이전</button>
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  disabled={!formData.username || !isUsernameChecked || !!usernameError || !formData.password || !!passwordError || !confirmPassword || !formData.email || !isEmailChecked || !agreedTerms || !agreedPrivacy || !isOver14}
                  style={{ 
                    flex: 2, 
                    padding: '0.8rem', 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: (!formData.username || !isUsernameChecked || !!usernameError || !formData.password || !!passwordError || !confirmPassword || !formData.email || !isEmailChecked || !agreedTerms || !agreedPrivacy || !isOver14) ? 'var(--border-color)' : 'var(--primary-color)', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    cursor: (!formData.username || !isUsernameChecked || !!usernameError || !formData.password || !!passwordError || !confirmPassword || !formData.email || !isEmailChecked || !agreedTerms || !agreedPrivacy || !isOver14) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.85rem'
                  }}
                >
                  다음 단계로
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Step 3: Nickname Setup (일반 구매자만) */}
        {step === 3 && formData.role !== 'SELLER' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '-0.02em' }}>닉네임 설정</h2>
            <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {formData.role === 'SELLER' ? '마켓명' : '프로필 닉네임'}
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input 
                    type="text" 
                    name="nickname"
                    placeholder={formData.role === 'SELLER' ? "사용할 마켓명을 적어주세요 (예: 슬리피마켓)" : "귀여운 닉네임을 적어주세요 (예: 말랑이)"} 
                    required 
                    value={formData.nickname}
                    onChange={handleChange}
                    style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckNickname}
                    style={{ 
                      padding: '0 0.8rem', 
                      borderRadius: '12px', 
                      border: isNicknameChecked ? '1px solid #10b981' : '1px solid var(--primary-color)', 
                      backgroundColor: isNicknameChecked ? '#10b981' : 'transparent', 
                      color: isNicknameChecked ? '#fff' : 'var(--primary-color)', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isNicknameChecked ? '✓ 완료' : '중복 확인'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
                <button type="button" onClick={handlePrevStep} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-sub)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>이전</button>
                {formData.role === 'SELLER' ? (
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={!formData.nickname || !isNicknameChecked}
                    style={{ 
                      flex: 2, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: 'none', 
                      backgroundColor: (!formData.nickname || !isNicknameChecked) ? 'var(--border-color)' : 'var(--primary-color)', 
                      color: '#fff', 
                      fontWeight: 'bold', 
                      cursor: (!formData.nickname || !isNicknameChecked) ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    다음 단계로
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSignup}
                    disabled={!formData.nickname || !isNicknameChecked || loading}
                    style={{ 
                      flex: 2, 
                      padding: '0.8rem', 
                      borderRadius: '12px', 
                      border: 'none', 
                      backgroundColor: (!formData.nickname || !isNicknameChecked || loading) ? 'var(--border-color)' : 'var(--primary-color)', 
                      color: '#fff', 
                      fontWeight: 'bold', 
                      cursor: (!formData.nickname || !isNicknameChecked || loading) ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {loading ? '가입 진행 중...' : '가입 완료하기'}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Step 4: Seller Info */}
        {step === 4 && formData.role === 'SELLER' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.02em' }}>판매자 심사 요청</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>샵 개설을 위해 필요한 간단한 기본 정보입니다.<br/><span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>*심사 완료까지 영업일 기준 1~2일 소요됩니다.</span></p>
            <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>스토어명 (필수)</label>
                <input 
                  type="text" 
                  name="shopName"
                  placeholder="예: 슬라임 팩토리" 
                  required 
                  value={sellerInfo.shopName}
                  onChange={handleSellerChange}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>사업자등록번호 (선택 - 추후 필수 전환)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <input 
                    type="text" 
                    value={sellerInfo.businessNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      let formatted = v;
                      if (v.length > 3 && v.length <= 5) formatted = v.slice(0,3) + '-' + v.slice(3);
                      else if (v.length > 5) formatted = v.slice(0,3) + '-' + v.slice(3,5) + '-' + v.slice(5,10);
                      
                      setSellerInfo({ ...sellerInfo, businessNumber: formatted });
                      setIsBusinessVerified(false);
                    }}
                    maxLength={12}
                    placeholder="123-45-67890 (입력 시 인증 필수)" 
                    readOnly={isBusinessVerified || isVerifyingBusiness}
                    style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: isBusinessVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!sellerInfo.businessNumber.trim()) {
                        alert('사업자등록번호를 입력해주세요.');
                        return;
                      }
                      const cleanNumber = sellerInfo.businessNumber.replace(/-/g, '');
                      if (cleanNumber.length !== 10) {
                        alert('사업자등록번호 10자리를 정확히 입력해주세요.');
                        return;
                      }
                      if (!sellerInfo.repName.trim()) {
                        alert('대표자 성명을 입력해주세요.');
                        return;
                      }
                      if (sellerInfo.startDate.length !== 8) {
                        alert('개업일자 8자리(YYYYMMDD)를 정확히 입력해주세요.');
                        return;
                      }
                      setIsVerifyingBusiness(true);
                      try {
                        const res = await sellerApi.verifyBusinessNumber(cleanNumber, sellerInfo.repName, sellerInfo.startDate);
                        if (res.isValid) {
                          alert(res.message || '정상 영업중인 사업자로 확인되었습니다.');
                          setIsBusinessVerified(true);
                        } else {
                          alert(res.message || '유효하지 않거나 휴/폐업 상태인 사업자등록번호입니다.');
                        }
                      } catch (err) {
                        alert('검증 중 오류가 발생했습니다.');
                      } finally {
                        setIsVerifyingBusiness(false);
                      }
                    }}
                    disabled={isBusinessVerified || isVerifyingBusiness}
                    style={{ padding: '0 1rem', borderRadius: '12px', border: 'none', backgroundColor: isBusinessVerified ? '#10b981' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: (isBusinessVerified || isVerifyingBusiness) ? 'default' : 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    {isVerifyingBusiness ? '인증 중...' : isBusinessVerified ? '✓ 인증완료' : '인증하기'}
                  </button>
                </div>
              </div>

              <div className="auth-form-group" style={{ marginTop: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>대표자 성명</label>
                <input 
                  type="text"
                  placeholder="예: 홍길동"
                  value={sellerInfo.repName}
                  onChange={(e) => {
                    setSellerInfo({ ...sellerInfo, repName: e.target.value });
                    setIsBusinessVerified(false);
                  }}
                  readOnly={isBusinessVerified || isVerifyingBusiness}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: isBusinessVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group" style={{ marginTop: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>개업일자 (YYYYMMDD)</label>
                <input 
                  type="text"
                  placeholder="예: 20240101"
                  maxLength={8}
                  value={sellerInfo.startDate}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setSellerInfo({ ...sellerInfo, startDate: v });
                    setIsBusinessVerified(false);
                  }}
                  readOnly={isBusinessVerified || isVerifyingBusiness}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: isBusinessVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>
              
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 1rem 0', lineHeight: '1.4' }}>
                * 대표자 성명 및 개업일자는 국세청 진위확인용으로만 1회성으로 사용되며, 당사 데이터베이스에 저장되지 않습니다.
              </p>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>쇼핑몰 주소 (필수)</label>
                <input type="url" name="shopUrl" placeholder="https://smartstore.naver.com/..." required value={sellerInfo.shopUrl} onChange={handleSellerChange} style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }} />
              </div>

              {/* SNS URL - URL 붙여넣기, 자동 아이콘 감지 */}
              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>SNS 링크 <span style={{ fontWeight: 'normal', color: 'var(--text-sub)' }}>(선택 · URL 붙여넣기하면 자동 인식)</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {sellerInfo.snsUrls.map((url, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getSnsIcon(url)}
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleSnsUrlChange(i, e.target.value)}
                        placeholder="https://instagram.com/내계정 또는 유튜브 링크 등"
                        style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                      />
                      {sellerInfo.snsUrls.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSnsUrl(i)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ffe5e5', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                      )}
                    </div>
                  ))}
                  {sellerInfo.snsUrls.length < 6 && (
                    <button type="button" onClick={handleAddSnsUrl} style={{ padding: '0.55rem', borderRadius: '10px', border: '1px dashed var(--border-color)', background: 'transparent', color: 'var(--text-sub)', fontSize: '0.8rem', cursor: 'pointer' }}>+ SNS 링크 추가</button>
                  )}
                </div>
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>소개글</label>
                <textarea 
                  name="introduction"
                  placeholder="마켓 및 판매 슬라임 종류에 대한 간단한 한 마디를 적어주세요." 
                  required 
                  rows="4"
                  value={sellerInfo.introduction}
                  onChange={handleSellerChange}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', marginTop: '0.4rem', fontFamily: 'inherit', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
                <button type="button" onClick={handlePrevStep} disabled={loading} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-sub)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>이전</button>
                <button 
                  type="button" 
                  onClick={handleSignup}
                  disabled={!sellerInfo.shopName || !sellerInfo.shopUrl || !sellerInfo.introduction || loading}
                  style={{ 
                    flex: 2, 
                    padding: '0.8rem', 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: (!sellerInfo.shopName || !sellerInfo.shopUrl || !sellerInfo.introduction || loading) ? 'var(--border-color)' : 'var(--primary-color)', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    cursor: (!sellerInfo.shopName || !sellerInfo.shopUrl || !sellerInfo.introduction || loading) ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {loading ? '신청 처리 중...' : '가입 및 신청 완료'}
                </button>
              </div>

            </div>
          </div>
        )}

        <p className="auth-link" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold', marginLeft: '0.3rem' }}>로그인</Link>
        </p>

      </div>
    </div>
  )
}
