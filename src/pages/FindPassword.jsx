import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function FindPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // 3 minutes = 180 seconds
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!formData.username || !formData.email) {
      alert('아이디와 이메일을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await authApi.sendPasswordResetCode({
        username: formData.username,
        email: formData.email
      });
      alert(res.data?.message || '이메일로 인증 코드가 발송되었습니다.');
      setStep(2);
      setTimeLeft(180); // Start 3-minute timer
    } catch (error) {
      alert(error.response?.data?.error || error.message || '일치하는 사용자 정보를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      alert('인증 시간이 만료되었습니다. 인증 코드를 다시 발송해주세요.');
      setStep(1);
      return;
    }
    
    setLoading(true);
    try {
      const res = await authApi.verifyPasswordResetCode({
        email: formData.email,
        code: formData.code
      });
      if (res.data?.valid || res.valid) {
        alert('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
        setStep(3);
      }
    } catch (error) {
      alert(error.response?.data?.error || error.message || '잘못된 인증 코드입니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      alert(res.data?.message || '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.error || error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container" style={{ minHeight: '85vh', padding: '2rem 1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2.2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.7rem', borderRadius: '16px', backgroundColor: '#ffe8f0', color: 'var(--primary-color)', marginBottom: '0.8rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: '0', letterSpacing: '-0.03em' }}>비밀번호 찾기</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.3rem' }}>
            {step === 1 && '가입 시 등록한 아이디와 이메일을 입력해주세요'}
            {step === 2 && '이메일로 발송된 6자리 인증 코드를 입력해주세요'}
            {step === 3 && '새롭게 사용할 비밀번호를 설정해주세요'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="auth-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>아이디 (ID)</label>
              <input 
                type="text" 
                name="username"
                placeholder="아이디를 입력하세요" 
                required 
                value={formData.username}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="auth-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>이메일 주소</label>
              <input 
                type="email" 
                name="email"
                placeholder="가입 시 등록한 이메일을 입력하세요" 
                required 
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !formData.username || !formData.email}
              style={{ 
                marginTop: '1rem', width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', 
                backgroundColor: (loading || !formData.username || !formData.email) ? 'var(--border-color)' : 'var(--primary-color)', 
                color: '#fff', fontWeight: 'bold', cursor: (loading || !formData.username || !formData.email) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem', transition: 'all 0.2s'
              }}
            >
              {loading ? '발송 중...' : '인증번호 발송'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="auth-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                인증 코드
              </label>
              <div style={{ position: 'relative', marginTop: '0.4rem' }}>
                <input 
                  type="text" 
                  name="code"
                  placeholder="6자리 코드 입력" 
                  required 
                  maxLength="6"
                  value={formData.code}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem 3.5rem 0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '1.2rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold' }}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: timeLeft > 0 ? 'var(--primary-color)' : '#ff4d4d', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || formData.code.length !== 6 || timeLeft <= 0}
              style={{ 
                marginTop: '1rem', width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', 
                backgroundColor: (loading || formData.code.length !== 6 || timeLeft <= 0) ? 'var(--border-color)' : 'var(--primary-color)', 
                color: '#fff', fontWeight: 'bold', cursor: (loading || formData.code.length !== 6 || timeLeft <= 0) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem', transition: 'all 0.2s'
              }}
            >
              {loading ? '인증 중...' : '인증하기'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={handleSendCode} 
                style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                인증 코드 다시 받기
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="auth-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>새 비밀번호</label>
              <input 
                type="password" 
                name="newPassword"
                placeholder="최소 8자 이상" 
                required 
                value={formData.newPassword}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="auth-form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>새 비밀번호 확인</label>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="비밀번호 재입력" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || formData.newPassword.length < 8 || formData.newPassword !== formData.confirmPassword}
              style={{ 
                marginTop: '1rem', width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', 
                backgroundColor: (loading || formData.newPassword.length < 8 || formData.newPassword !== formData.confirmPassword) ? 'var(--border-color)' : 'var(--primary-color)', 
                color: '#fff', fontWeight: 'bold', cursor: (loading || formData.newPassword.length < 8 || formData.newPassword !== formData.confirmPassword) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem', transition: 'all 0.2s'
              }}
            >
              {loading ? '변경 중...' : '비밀번호 변경 완료'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" style={{ color: 'var(--text-sub)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}>로그인</Link>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <Link to="/signup" style={{ color: 'var(--text-sub)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}>회원가입</Link>
        </div>

      </div>
    </div>
  );
}
