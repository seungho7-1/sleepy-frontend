import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/products';
import { authApi } from '../../api/auth';
import ProductCard from '../../components/ProductCard';
import { Share2, Bookmark, Link as LinkIcon, Edit3, X, Search } from 'lucide-react';
import { useAuthStore } from '../../store';

const CATEGORIES = ['전체', '슬라임', '슬랑이', '말랑이', '스퀴시'];
const SORTS = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '인기순', value: 'reviewCount,desc' },
  { label: '저가순', value: 'price,asc' },
  { label: '고가순', value: 'price,desc' },
];

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

export default function SellerShopPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const { token } = useAuthStore();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeSort, setActiveSort] = useState('createdAt,desc');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [myInfo, setMyInfo] = useState(null);
  const [snsUrls, setSnsUrls] = useState(['']);
  const [editForm, setEditForm] = useState({
    introduction: '',
    siteUrl: '',
  });

  useEffect(() => {
    if (token) {
      authApi.me().then((data) => setMyInfo(data)).catch(() => {});
    }
  }, [token]);

  // Fetch Seller Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getSellerProfile(sellerId);
        setSellerInfo(data);
      } catch (err) {
        console.error('판매자 정보를 불러오는 데 실패했습니다.', err);
      }
    };
    if (sellerId) fetchProfile();
  }, [sellerId]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let categoryApiValue = activeCategory;
        if (activeCategory === '전체') {
          categoryApiValue = '';
        } else if (activeCategory === '슬라임') {
          categoryApiValue = 'SLIME';
        } else if (activeCategory === '슬랑이') {
          categoryApiValue = 'SLANGI';
        } else if (activeCategory === '말랑이') {
          categoryApiValue = 'MALANGI';
        } else if (activeCategory === '스퀴시') {
          categoryApiValue = 'SQUISHY';
        }

        const data = await productApi.getProducts(categoryApiValue, keyword, sellerId, 0, 100, activeSort);
        setProducts(data.content || []);
      } catch (err) {
        console.error('상품을 불러오는 데 실패했습니다.', err);
      } finally {
        setLoading(false);
      }
    };
    if (sellerId) fetchProducts();
  }, [sellerId, activeCategory, activeSort, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  const handleScrap = async () => {
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    try {
      const res = await authApi.toggleBrandScrap(sellerId);
      setSellerInfo(prev => ({ ...prev, isScrapped: res.isScrapped, scrapCount: res.scrapCount }));
    } catch (err) {
      alert('스크랩 처리에 실패했습니다.');
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      introduction: sellerInfo.introduction || '',
      siteUrl: sellerInfo.siteUrl || '',
    });
    const existingSns = [sellerInfo.youtubeUrl, sellerInfo.instagramUrl, sellerInfo.facebookUrl, sellerInfo.tiktokUrl].filter(Boolean);
    setSnsUrls(existingSns.length > 0 ? existingSns : ['']);
    setShowEditModal(true);
  };

  const handleSnsUrlChange = (i, val) => { const n = [...snsUrls]; n[i] = val; setSnsUrls(n); };
  const handleAddSnsUrl = () => { if (snsUrls.length < 6) setSnsUrls([...snsUrls, '']); };
  const handleRemoveSnsUrl = (i) => { const n = snsUrls.filter((_, idx) => idx !== i); setSnsUrls(n.length ? n : ['']); };
  const classifySnsUrls = (urls) => {
    const filled = urls.filter(u => u.trim());
    const find = (patterns) => filled.find(u => patterns.some(p => u.toLowerCase().includes(p))) || '';
    return { youtubeUrl: find(['youtube.com','youtu.be']), instagramUrl: find(['instagram.com']), facebookUrl: find(['facebook.com','fb.com']), tiktokUrl: find(['tiktok.com']) };
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateSellerProfile({
        ...editForm,
        ...classifySnsUrls(snsUrls)
      });
      alert('프로필이 성공적으로 수정되었습니다.');
      setShowEditModal(false);
      // Reload profile
      const data = await authApi.getSellerProfile(sellerId);
      setSellerInfo(data);
    } catch (err) {
      alert('프로필 수정에 실패했습니다.');
    }
  };

  if (!sellerInfo) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Seller Banner */}
      <div 
        style={{
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          padding: '4rem 1.5rem',
          position: 'relative'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', '@media (minWidth: 768px)': { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' } }} className="shop-banner-layout">
            <div style={{ flex: 1, maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px', wordBreak: 'break-word' }}>
                  {sellerInfo.shopName}
                </h1>
                {myInfo && myInfo.id === Number(sellerId) && (
                  <button onClick={handleOpenEdit} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>
                    <Edit3 size={14} /> 수정
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e0e0e0', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {sellerInfo.introduction}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {sellerInfo.profileImageUrl ? (
                  <img src={sellerInfo.profileImageUrl} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff2070', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {sellerInfo.shopName.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
                  <span style={{ color: '#ff2070', fontWeight: 'bold' }}>{sellerInfo.scrapCount || 0}</span>명이 이 브랜드 상품을 스크랩했어요
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1.5rem' }}>
                {sellerInfo.siteUrl && (
                  <a href={sellerInfo.siteUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="쇼핑몰 사이트">
                    <LinkIcon size={20} />
                  </a>
                )}
                {sellerInfo.youtubeUrl && (
                  <a href={sellerInfo.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="유튜브">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                )}
                {sellerInfo.instagramUrl && (
                  <a href={sellerInfo.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="인스타그램">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {sellerInfo.facebookUrl && (
                  <a href={sellerInfo.facebookUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="페이스북">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                )}
                {sellerInfo.tiktokUrl && (
                  <a href={sellerInfo.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', opacity: 0.8 }} title="틱톡">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', position: 'absolute', top: 0, right: 0 }} className="shop-banner-actions">
              <button style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={20} />
              </button>
              <button onClick={handleScrap} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', border: 'none', color: sellerInfo.isScrapped ? '#ff2070' : '#fff', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bookmark size={20} fill={sellerInfo.isScrapped ? '#ff2070' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Shop Navigation / Filters */}
      <div style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '64px', background: '#fff', zIndex: 50 }}>
        <div className="container shop-nav-container">
          
          <div className="shop-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  fontSize: '1rem',
                  fontWeight: activeCategory === cat ? 'bold' : '500',
                  color: activeCategory === cat ? 'var(--primary-color)' : '#555',
                  borderBottom: activeCategory === cat ? '3px solid var(--primary-color)' : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="shop-nav-filters">
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '24px', padding: '6px 14px', background: '#f5f5f5', flex: 1, minWidth: '140px', maxWidth: '200px', transition: 'all 0.2s' }}>
              <Search size={16} color="#888" style={{ marginRight: '6px', flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="스토어 내 검색" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%' }}
              />
            </form>

            <select 
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.9rem', color: '#555', cursor: 'pointer', background: 'transparent' }}
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 3. Product Grid */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>
          {activeCategory === '전체' ? '전체 상품' : `${activeCategory} 상품`}
        </h2>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>상품을 불러오는 중...</div>
        ) : products.length > 0 ? (
          <div className="media-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '100px 20px', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            등록된 상품이 없습니다.
          </div>
        )}
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>프로필 수정</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>쇼핑몰 주소</label>
                <input type="url" value={editForm.siteUrl} onChange={e => setEditForm({...editForm, siteUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>SNS 링크 <span style={{ fontWeight: 'normal', color: 'var(--text-sub)', fontSize: '0.8rem' }}>(URL 붙여넣기하면 자동 인식)</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {snsUrls.map((url, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getSnsIcon(url)}
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleSnsUrlChange(i, e.target.value)}
                        placeholder="https://instagram.com/... 등"
                        style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none' }}
                      />
                      {snsUrls.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSnsUrl(i)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#ffe5e5', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                      )}
                    </div>
                  ))}
                  {snsUrls.length < 6 && (
                    <button type="button" onClick={handleAddSnsUrl} style={{ padding: '0.55rem', borderRadius: '8px', border: '1px dashed #ccc', background: 'transparent', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>+ SNS 링크 추가</button>
                  )}
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '1rem', background: '#ff2070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>저장하기</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
