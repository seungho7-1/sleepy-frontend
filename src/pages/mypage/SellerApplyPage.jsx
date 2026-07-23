import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../../api/seller';

export default function SellerApplyPage() {
  const [shopName, setShopName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [snsUrls, setSnsUrls] = useState(['']);
  const [introduction, setIntroduction] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyingBusiness, setIsVerifyingBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddSnsUrl = () => {
    if (snsUrls.length >= 5) {
      alert('SNS 주소는 최대 5개까지 등록할 수 있습니다.')
      return
    }
    setSnsUrls([...snsUrls, ''])
  }

  const handleRemoveSnsUrl = (index) => {
    setSnsUrls(snsUrls.filter((_, i) => i !== index))
  }

  const handleSnsUrlChange = (index, value) => {
    const newSnsUrls = [...snsUrls]
    newSnsUrls[index] = value
    setSnsUrls(newSnsUrls)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName || !siteUrl || !introduction) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (businessNumber.trim() && !isVerified) {
      alert('입력하신 사업자등록번호 인증을 완료해주세요. (또는 빈칸으로 남겨주세요)');
      return;
    }
    setLoading(true);
    try {
      await sellerApi.apply({ 
        shopName, 
        siteUrl, 
        snsUrls: snsUrls.filter(url => url.trim() !== '').join(','),
        introduction,
        businessNumber: businessNumber ? businessNumber.replace(/-/g, '') : null
      });
      alert('셀러 신청이 완료되었습니다. 관리자 승인을 기다려주세요.');
      navigate('/mypage');
    } catch (error) {
      alert(error.message || '셀러 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '85vh', padding: '2rem 1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2.2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.02em' }}>판매자 심사 요청</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          샵 개설을 위해 필요한 간단한 기본 정보입니다.<br/>
          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>*심사 완료까지 영업일 기준 1~2일 소요됩니다.</span>
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>스토어명 (필수)</label>
            <input 
              type="text" 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="예: 슬라임 팩토리" 
              required 
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>

          <div className="auth-form-group">
            <div className="form-group">
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
                    setIsVerified(false);
                  }}
                  maxLength={12}
                  placeholder="123-45-67890 (입력 시 인증 필수)" 
                  readOnly={isVerified || isVerifyingBusiness}
                  style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: isVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
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
                    setIsVerifyingBusiness(true);
                    try {
                      const res = await sellerApi.verifyBusinessNumber(cleanNumber);
                    if (res.isValid) {
                      alert('정상 영업중인 사업자로 확인되었습니다.');
                      setIsVerified(true);
                    } else {
                      alert('유효하지 않거나 휴/폐업 상태인 사업자등록번호입니다.');
                    }
                    } catch (err) {
                      alert('검증 중 오류가 발생했습니다.');
                    } finally {
                      setIsVerifyingBusiness(false);
                    }
                  }}
                  disabled={isVerified || isVerifyingBusiness}
                  style={{ padding: '0 1rem', borderRadius: '12px', border: 'none', backgroundColor: isVerified ? '#10b981' : 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: (isVerified || isVerifyingBusiness) ? 'default' : 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {isVerifyingBusiness ? '인증 중...' : isVerified ? '✓ 인증완료' : '인증하기'}
                </button>
            </div>
          </div>
          </div>

          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>쇼핑몰 주소 (필수)</label>
            <input 
              type="url" 
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://smartstore.naver.com/..." 
              required 
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>

          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>SNS 주소 (선택)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
              {snsUrls.map((snsUrl, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input 
                    type="url" 
                    placeholder="인스타그램, 유튜브 등 주소 입력" 
                    value={snsUrl}
                    onChange={(e) => handleSnsUrlChange(index, e.target.value)}
                    style={{ flex: 1, padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  {snsUrls.length > 1 && (
                    <button type="button" onClick={() => handleRemoveSnsUrl(index)} style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', backgroundColor: '#ffe5e5', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  )}
                </div>
              ))}
              {snsUrls.length < 5 && (
                <button type="button" onClick={handleAddSnsUrl} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px dashed var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.2rem' }}>
                  + SNS 주소 추가하기
                </button>
              )}
            </div>
          </div>

          <div className="auth-form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>소개글</label>
            <textarea 
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="마켓 및 판매 슬라임 종류에 대한 간단한 한 마디를 적어주세요." 
              required 
              rows="4"
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', marginTop: '0.4rem', fontFamily: 'inherit', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem',
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: loading ? 'var(--border-color)' : 'var(--primary-color)', 
              color: '#fff', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '신청 처리 중...' : '신청 완료하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
