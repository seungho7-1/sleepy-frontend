import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { authApi } from '../../api/auth'
import { sellerApi } from '../../api/seller'

export default function OAuth2Onboarding() {
  const [nickname, setNickname] = useState('')
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)
  const [role, setRole] = useState('BUYER') // BUYER, SELLER
  const [shopName, setShopName] = useState('')
  const [shopUrl, setShopUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')
  const [repName, setRepName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [isBusinessVerified, setIsBusinessVerified] = useState(false)
  const [isVerifyingBusiness, setIsVerifyingBusiness] = useState(false)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [isOver14, setIsOver14] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlToken = params.get('token')
    const urlNickname = params.get('nickname')
    
    if (urlToken) {
      setToken(urlToken)
    } else {
      // No token means they shouldn't access this page directly
      navigate('/login')
    }

    if (urlNickname) {
      setNickname(decodeURIComponent(urlNickname))
    }
  }, [location, navigate])



  const handleCheckNickname = async () => {
    if (nickname.trim().length < 2) {
      alert('닉네임은 최소 2글자 이상이어야 합니다.');
      return;
    }
    try {
      // Temporarily write token so request interceptor includes it
      login(token, 'BUYER', nickname);
      
      const response = await authApi.checkNickname(nickname);
      if (response.exists) {
        alert('이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      } else {
        alert('사용 가능한 닉네임입니다!');
        setIsNicknameChecked(true);
      }
    } catch (err) {
      alert(err.message || '닉네임 확인 중 오류가 발생했습니다.');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요!')
      return
    }

    if (!isNicknameChecked) {
      alert('닉네임 중복 확인을 진행해 주세요.')
      return
    }

    if (!isOver14 || !agreedTerms || !agreedPrivacy) {
      alert('필수 약관에 모두 동의해 주세요.')
      return
    }

    if (role === 'SELLER') {
      if (!shopName.trim()) {
        alert('스토어명을 입력해 주세요!')
        return
      }
      if (!shopUrl.trim()) {
        alert('쇼핑몰 URL을 입력해 주세요!')
        return
      }
      if (!introduction.trim()) {
        alert('소개글을 입력해 주세요!')
        return
      }
      if (businessNumber.trim() && !isBusinessVerified) {
        alert('입력하신 사업자등록번호 인증을 완료해 주세요! (또는 빈칸으로 남겨주세요)');
        return
      }
    }

    setLoading(true)
    try {
      // 1. Temporarily log in with the OAuth token so it's sent in headers
      login(token, 'BUYER', nickname)

      // 2. Call the onboarding API to finalize registration details
      const response = await authApi.oauth2Onboarding({
        nickname,
        role,
        shopName: role === 'SELLER' ? shopName : null,
        siteUrl: role === 'SELLER' ? shopUrl : null,
        youtubeUrl: role === 'SELLER' ? youtubeUrl : null,
        instagramUrl: role === 'SELLER' ? instagramUrl : null,
        facebookUrl: role === 'SELLER' ? facebookUrl : null,
        tiktokUrl: role === 'SELLER' ? tiktokUrl : null,
        introduction: role === 'SELLER' ? introduction : null,
        businessNumber: role === 'SELLER' && businessNumber ? businessNumber.replace(/-/g, '') : null
      })

      // 3. Save the finalized user role and nickname returned by the API
      login(token, response.role, response.nickname)
      
      alert('가입이 완료되었습니다! 반갑습니다!')
      navigate('/mypage')
    } catch (error) {
      alert(error.message || '가입 완료 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ minHeight: '85vh', padding: '2rem 1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2.2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
        <div className="auth-logo-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="auth-logo-icon" style={{ display: 'inline-flex', padding: '0.7rem', borderRadius: '16px', backgroundColor: '#ffe8f0', color: 'var(--primary-color)', marginBottom: '0.8rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <path d="M9 9h.01M15 9h.01" strokeWidth="3" />
            </svg>
          </div>
          <span className="auth-logo-text" style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>SLEEPY</span>
          <span className="auth-logo-sub" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.3rem' }}>환영합니다! 추가 정보를 입력해 주세요.</span>
        </div>

        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '-0.02em' }}>반갑습니다!</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-sub)', marginBottom: '1.5rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
          서비스 이용을 위해 닉네임과 가입 유형을 선택해 주세요.
          {role === 'SELLER' && (
            <><br/><span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>*심사 완료까지 영업일 기준 1~2일 소요됩니다.</span></>
          )}
        </p>

        <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Nickname Input */}
          <div className="auth-form-group">
            <label htmlFor="nickname" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
              {role === 'SELLER' ? '마켓명' : '닉네임'}
            </label>
            <div className="input-wrapper" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span className="input-icon" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input 
                  id="nickname"
                  type="text" 
                  placeholder={role === 'SELLER' ? "사용할 마켓명" : "사용할 닉네임"} 
                  required 
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value)
                    setIsNicknameChecked(false)
                  }}
                  style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>
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

          {/* Role Selection */}
          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>가입 유형</label>
            <div className="role-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className={`role-btn ${role === 'BUYER' ? 'active' : ''}`}
                onClick={() => setRole('BUYER')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: role === 'BUYER' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: role === 'BUYER' ? '#ffe8f0' : 'transparent',
                  color: role === 'BUYER' ? 'var(--primary-color)' : 'var(--text-sub)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}
              >
                일반 구매자
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'SELLER' ? 'active' : ''}`}
                onClick={() => setRole('SELLER')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: role === 'SELLER' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: role === 'SELLER' ? '#ffe8f0' : 'transparent',
                  color: role === 'SELLER' ? 'var(--primary-color)' : 'var(--text-sub)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}
              >
                마켓 사장님
              </button>
            </div>
          </div>

          {/* Seller Details (Conditional) */}
          {role === 'SELLER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
              <div className="auth-form-group">
                <label htmlFor="shopName" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>스토어명 (필수)</label>
                <div className="input-wrapper" style={{ position: 'relative', marginTop: '0.4rem' }}>
                  <input
                    id="shopName"
                    type="text"
                    placeholder="예: 슬라임 팩토리"
                    required={role === 'SELLER'}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>사업자등록번호 (선택 - 추후 필수 전환)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <input 
                    type="text" 
                    value={businessNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      let formatted = v;
                      if (v.length > 3 && v.length <= 5) formatted = v.slice(0,3) + '-' + v.slice(3);
                      else if (v.length > 5) formatted = v.slice(0,3) + '-' + v.slice(3,5) + '-' + v.slice(5,10);
                      
                      setBusinessNumber(formatted);
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
                      if (!businessNumber.trim()) {
                        alert('사업자등록번호를 입력해주세요.');
                        return;
                      }
                      const cleanNumber = businessNumber.replace(/-/g, '');
                      if (cleanNumber.length !== 10) {
                        alert('사업자등록번호 10자리를 정확히 입력해주세요.');
                        return;
                      }
                      if (!repName.trim()) {
                        alert('대표자 성명을 입력해주세요.');
                        return;
                      }
                      if (startDate.length !== 8) {
                        alert('개업일자 8자리(YYYYMMDD)를 정확히 입력해주세요.');
                        return;
                      }
                      setIsVerifyingBusiness(true);
                      try {
                        const res = await sellerApi.verifyBusinessNumber(cleanNumber, repName, startDate);
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
                  value={repName}
                  onChange={(e) => {
                    setRepName(e.target.value);
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
                  value={startDate}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setStartDate(v);
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
                <label htmlFor="shopUrl" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>쇼핑몰 주소 (필수)</label>
                <div className="input-wrapper" style={{ position: 'relative', marginTop: '0.4rem' }}>
                  <span className="input-icon" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input
                    id="shopUrl"
                    type="url"
                    placeholder="https://smartstore.naver.com/..."
                    required={role === 'SELLER'}
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.4rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>유튜브 URL (선택)</label>
                <input 
                  type="url" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/..." 
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>인스타그램 URL (선택)</label>
                <input 
                  type="url" 
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..." 
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>페이스북 URL (선택)</label>
                <input 
                  type="url" 
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..." 
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>틱톡 URL (선택)</label>
                <input 
                  type="url" 
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/..." 
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="introduction" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>마켓 소개</label>
                <textarea
                  id="introduction"
                  placeholder="판매하는 슬라임 종류와 마켓 설명을 간략히 적어주세요."
                  required={role === 'SELLER'}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    marginTop: '0.4rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Terms and Privacy Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#333' }}>
              <input 
                type="checkbox" 
                checked={isOver14}
                onChange={(e) => setIsOver14(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <span>[필수] 만 14세 이상입니다.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#333' }}>
              <input 
                type="checkbox" 
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <span>[필수] <a href="/terms" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>서비스 이용약관</a> 동의</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#333' }}>
              <input 
                type="checkbox" 
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <span>[필수] <a href="/privacy" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>개인정보 수집 및 이용</a> 동의 {role === 'SELLER' && '(사업자등록번호 포함)'}</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || (role === 'SELLER' && (!shopName || !shopUrl || !introduction)) || !isNicknameChecked || !isOver14 || !agreedTerms || !agreedPrivacy} 
            style={{ 
              marginTop: '0.5rem', 
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: (loading || (role === 'SELLER' && (!shopName || !shopUrl || !introduction)) || !isNicknameChecked || !isOver14 || !agreedTerms || !agreedPrivacy) ? 'var(--border-color)' : 'var(--primary-color)', 
              color: '#fff', 
              fontWeight: 'bold', 
              cursor: (loading || (role === 'SELLER' && (!shopName || !shopUrl || !introduction)) || !isNicknameChecked || !isOver14 || !agreedTerms || !agreedPrivacy) ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {loading ? '처리 중...' : '온보딩 완료하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
