import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../api/seller';

export default function SellerApplyPage() {
  const [siteUrl, setSiteUrl] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sellerApi.apply({ siteUrl, introduction });
      alert('셀러 신청이 완료되었습니다. 관리자 승인을 기다려주세요.');
      navigate('/mypage');
    } catch (error) {
      alert(error.message || '셀러 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>셀러 신청</h2>
      <div className="card" style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="siteUrl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>쇼핑몰/SNS URL</label>
            <input
              id="siteUrl"
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label htmlFor="introduction" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>소개</label>
            <textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="주력 판매 상품, 셀러 경력 등을 자유롭게 적어주세요."
              required
              rows="5"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#1E1E1E', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '신청 중...' : '셀러 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
