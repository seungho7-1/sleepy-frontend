import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 8) {
      alert('새 비밀번호는 최소 8글자 이상 입력해 주세요.');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      alert('기존 비밀번호와 다른 비밀번호를 설정해 주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      alert(response.message || '비밀번호가 성공적으로 변경되었습니다.');
      navigate('/mypage');
    } catch (error) {
      alert(error.message || '비밀번호 변경에 실패했습니다. 기존 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '85vh', padding: '2rem 1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2.2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: '0', letterSpacing: '-0.03em' }}>비밀번호 변경</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.3rem' }}>안전한 계정 사용을 위해 비밀번호를 변경해 주세요</p>
        </div>

        <form onSubmit={handleChangePassword} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>기존 비밀번호</label>
            <div style={{ position: 'relative', marginTop: '0.4rem' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="oldPassword"
                placeholder="현재 비밀번호를 입력하세요" 
                required 
                value={formData.oldPassword}
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
          </div>

          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>새 비밀번호</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="newPassword"
              placeholder="최소 8글자 이상 입력하세요" 
              required 
              value={formData.newPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>

          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>새 비밀번호 확인</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="confirmPassword"
              placeholder="동일한 비밀번호를 한번 더 입력하세요" 
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              disabled={loading}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-sub)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
              style={{ 
                flex: 2, 
                padding: '0.85rem', 
                borderRadius: '12px', 
                border: 'none', 
                backgroundColor: (loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword) ? 'var(--border-color)' : 'var(--primary-color)', 
                color: '#fff', 
                fontWeight: 'bold', 
                cursor: (loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
