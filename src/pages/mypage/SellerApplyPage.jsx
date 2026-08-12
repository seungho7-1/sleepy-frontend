import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../../api/seller';
import SnsIcon from '../../components/SnsIcon';

export default function SellerApplyPage() {
  const [shopName, setShopName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [snsUrls, setSnsUrls] = useState(['']);
  const [introduction, setIntroduction] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [repName, setRepName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyingBusiness, setIsVerifyingBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSnsUrlChange = (i, val) => { const n = [...snsUrls]; n[i] = val; setSnsUrls(n); };
  const handleAddSnsUrl = () => { if (snsUrls.length < 6) setSnsUrls([...snsUrls, '']); };
  const handleRemoveSnsUrl = (i) => { const n = snsUrls.filter((_, idx) => idx !== i); setSnsUrls(n.length ? n : ['']); };
  const classifySnsUrls = (urls) => {
    const filled = urls.filter(u => u.trim());
    const find = (patterns) => filled.find(u => patterns.some(p => u.toLowerCase().includes(p))) || '';
    return { youtubeUrl: find(['youtube.com','youtu.be']), instagramUrl: find(['instagram.com']), facebookUrl: find(['facebook.com','fb.com']), tiktokUrl: find(['tiktok.com']) };
  };



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
        ...classifySnsUrls(snsUrls),
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
          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>*심사는 보통 몇 시간 내에 완료되며, 최대 24시간 정도 소요될 수 있습니다.</span>
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
                      setIsVerified(true);
                    } else {
                      alert(res.message || '유효하지 않거나 휴/폐업 상태인 사업자등록번호입니다.');
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
          
          <div className="auth-form-group" style={{ marginTop: '0.8rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>대표자 성명</label>
            <input 
              type="text"
              placeholder="예: 홍길동"
              value={repName}
              onChange={(e) => {
                setRepName(e.target.value);
                setIsVerified(false);
              }}
              readOnly={isVerified || isVerifyingBusiness}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: isVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
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
                setIsVerified(false);
              }}
              readOnly={isVerified || isVerifyingBusiness}
              style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', marginTop: '0.4rem', backgroundColor: isVerified ? '#f3f4f6' : 'var(--bg-secondary)', color: 'var(--text-main)' }}
            />
          </div>
          
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 1rem 0', lineHeight: '1.4' }}>
            * 대표자 성명 및 개업일자는 국세청 진위확인용으로만 1회성으로 사용되며, 당사 데이터베이스에 저장되지 않습니다.
          </p>
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
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>SNS 링크 <span style={{ fontWeight: 'normal', color: 'var(--text-sub)' }}>(선택 · URL 붙여넣기하면 자동 인식)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {snsUrls.map((url, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SnsIcon url={url} />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleSnsUrlChange(i, e.target.value)}
                    placeholder="https://instagram.com/내계정 또는 유튜브 링크 등"
                    style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                  />
                  {snsUrls.length > 1 && (
                    <button type="button" onClick={() => handleRemoveSnsUrl(i)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ffe5e5', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  )}
                </div>
              ))}
              {snsUrls.length < 6 && (
                <button type="button" onClick={handleAddSnsUrl} style={{ padding: '0.55rem', borderRadius: '10px', border: '1px dashed var(--border-color)', background: 'transparent', color: 'var(--text-sub)', fontSize: '0.8rem', cursor: 'pointer' }}>+ SNS 링크 추가</button>
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
