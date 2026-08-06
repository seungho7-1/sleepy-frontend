import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../../api/products'
import { boardApi } from '../../api/board'
import { reviewApi } from '../../api/reviews'
import { authApi } from '../../api/auth'
import ProductCard from '../../components/ProductCard'
import { Building, Edit2, Image as ImageIcon, ClipboardList, ShoppingCart, FileText, Video, MessageCircle } from 'lucide-react'
export default function SellerDashboard() {
  const { token, role, nickname } = useAuthStore()
  const navigate = useNavigate()
  
  const [myInfo, setMyInfo] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'reviews'
  const [filterCategory, setFilterCategory] = useState('전체')
  const [sortBy, setSortBy] = useState('latest')
  
  const [showForm, setShowForm] = useState(false)
  const [crawlUrl, setCrawlUrl] = useState('')
  const [isCrawling, setIsCrawling] = useState(false)
  
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingVid, setUploadingVid] = useState(false)
  const [uploadingDescImg, setUploadingDescImg] = useState(false)
  const [mediaOption, setMediaOption] = useState('NONE') // 'NONE', 'FILE', 'LINK'
  
  // Up to 5 image URLs list
  const [imageUrls, setImageUrls] = useState([])
  const [descriptionImageUrls, setDescriptionImageUrls] = useState([])
  
  // Track if we are editing a product
  const [editingProductId, setEditingProductId] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [tagsList, setTagsList] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    texture: '',
    description: '',
    shopName: '',
    purchaseUrl: '',
    videoUrl: '',
    videoType: 'NONE',
    category: 'SLIME'
  })

  useEffect(() => {
    if (role !== 'SELLER') {
      alert('판매자만 접근 가능합니다.')
      navigate('/')
      return
    }
    const fetchMyInfo = async () => {
      try {
        const data = await authApi.me();
        setMyInfo(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMyInfo();
    fetchMyProducts()
  }, [role])


  const fetchMyProducts = async () => {
    try {
      const data = await productApi.getMyProducts();
      setMyProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleToggleForm = () => {
    // Clear form on close
    setFormData({ name: '', price: '', texture: '', description: '', shopName: '', purchaseUrl: '', videoUrl: '', videoType: 'NONE', category: 'SLIME' });
    setImageUrls([]);
    setDescriptionImageUrls([]);
    setMediaOption('NONE');
    setEditingProductId(null);
    setTagsList([]);
    setTagInput('');
    setActiveTab('add-product');
  }

  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    setFormData({
      name: p.name || '',
      price: p.price ? p.price.toString() : '',
      texture: p.texture || '',
      description: p.description || '',
      shopName: p.shopName || '',
      purchaseUrl: p.purchaseUrl || '',
      videoUrl: p.videoUrl || '',
      videoType: p.videoType || 'NONE',
      category: p.category || 'SLIME'
    });
    setTagsList(p.tags || []);
    setTagInput('');
    setImageUrls(p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [p.imageUrl]);
    setDescriptionImageUrls(p.descriptionImageUrls || []);
    setMediaOption(p.videoType || 'NONE');
    setActiveTab('add-product');
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (imageUrls.length + files.length > 5) {
      alert('대표 이미지는 최대 5개까지만 등록할 수 있습니다.');
      return;
    }
    try {
      setUploadingImg(true);
      for (const file of files) {
        const res = await boardApi.uploadFile(file, 'product-main');
        setImageUrls(prev => [...prev, res.url]);
      }
      alert('선택한 대표 이미지 업로드 완료!');
    } catch (err) {
      alert('이미지 업로드에 실패했습니다. 파일 크기가 너무 크거나 서버 연결이 불안정할 수 있습니다.');
    } finally {
      setUploadingImg(false);
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Limit video size to 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('슬라임 재생 동영상은 50MB 이하의 짧은 영상만 등록 가능합니다.');
      return;
    }

    try {
      setUploadingVid(true);
      const res = await boardApi.uploadFile(file, 'product-video');
      setFormData(prev => ({ ...prev, videoUrl: res.url, videoType: 'FILE' }));
      alert('슬라임 동영상 업로드 완료!');
    } catch (err) {
      alert('동영상 업로드에 실패했습니다.');
    } finally {
      setUploadingVid(false);
    }
  }

  const handleDescImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (descriptionImageUrls.length + files.length > 15) {
      alert('상세 설명 이미지는 최대 15개까지만 등록할 수 있습니다.');
      return;
    }
    try {
      setUploadingDescImg(true);
      for (const file of files) {
        const res = await boardApi.uploadFile(file, 'product-detail');
        setDescriptionImageUrls(prev => [...prev, res.url]);
      }
      alert('선택한 상세 이미지 업로드 완료!');
    } catch (err) {
      alert('상세 설명 이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingDescImg(false);
    }
  }

  const handleCrawl = async () => {
    if (!crawlUrl) {
      alert('상품 URL을 입력해주세요.');
      return;
    }
    try {
      setIsCrawling(true);
      const data = await productApi.crawlProduct(crawlUrl);
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        purchaseUrl: crawlUrl,
        videoUrl: '',
        videoType: 'NONE'
      }));
      setMediaOption('NONE');
      if (data.imageUrl) {
        setImageUrls([data.imageUrl]);
      } else {
        setImageUrls([]);
      }
      alert('상품 정보 자동완성 완료! (스토어 메타데이터 추출 완료)');
    } catch (err) {
      alert(err.response?.data?.error || '정보를 불러오지 못했습니다. 직접 입력해주세요.');
    } finally {
      setIsCrawling(false);
    }
  }

  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      alert('최소 1개 이상의 대표 이미지를 등록해야 합니다.');
      return;
    }
    if (isSubmittingProduct) return;

    setIsSubmittingProduct(true);
    try {
      let finalVideoUrl = formData.videoUrl;
      let finalVideoType = formData.videoType;

      if (mediaOption === 'NONE') {
        finalVideoUrl = '';
        finalVideoType = 'NONE';
      } else if (mediaOption === 'LINK') {
        finalVideoType = 'LINK';
      }

      const productPayload = {
        ...formData,
        imageUrls: imageUrls,
        descriptionImageUrls: descriptionImageUrls,
        videoUrl: finalVideoUrl,
        videoType: finalVideoType,
        price: parseInt(formData.price) || 0,
        tags: tagsList,
        category: formData.category || 'SLIME'
      };

      if (editingProductId) {
        await productApi.updateProduct(editingProductId, productPayload);
        alert('상품이 성공적으로 수정되었습니다.');
      } else {
        await productApi.createProduct(productPayload);
        alert('상품이 성공적으로 등록되었습니다.');
      }

      setFormData({ name: '', price: '', texture: '', description: '', shopName: '', purchaseUrl: '', videoUrl: '', videoType: 'NONE', category: 'SLIME' });
      setImageUrls([]);
      setDescriptionImageUrls([]);
      setMediaOption('NONE');
      setTagsList([]);
      setTagInput('');
      setEditingProductId(null);
      setActiveTab('products');
      fetchMyProducts();
    } catch (err) {
      alert(err.message || '요청 처리에 실패했습니다.');
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
      await productApi.deleteProduct(id);
      alert('삭제되었습니다.');
      fetchMyProducts();
    } catch (err) {
      alert(err.response?.data || err.message || '삭제에 실패했습니다.');
    }
  }

  if (role !== 'SELLER') return null

  return (
    <div className="mypage-container">
      {/* 1. Seller Banner - MyPage 스타일 */}
      <div className="mypage-banner">
        <div className="mypage-banner-content">

          {/* 아바타 */}
          <div className="profile-avatar-container" style={{ position: 'relative', display: 'inline-block', width: '80px', height: '80px', flexShrink: 0 }}>
            <div className="profile-avatar" style={{ overflow: 'hidden', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '2.2rem', fontWeight: 'bold' }}>
              {myInfo?.profileImageUrl ? (
                <img src={myInfo.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                nickname ? nickname.charAt(0).toUpperCase() : 'U'
              )}
            </div>
          </div>

          {/* 닉네임 + 뱃지 + SNS */}
          <div className="profile-info-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{nickname}님</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="role-badge" style={{ margin: 0, flexShrink: 0 }}>슬라임 판매자</span>
              {myInfo?.introduction && (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{myInfo.introduction}</span>
              )}
            </div>
            {/* SNS 링크 */}
            {myInfo && (myInfo.siteUrl || myInfo.youtubeUrl || myInfo.instagramUrl || myInfo.facebookUrl || myInfo.tiktokUrl) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                {myInfo.siteUrl && <a href={myInfo.siteUrl} target="_blank" rel="noreferrer" style={{ color: '#777' }} title="쇼핑몰"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></a>}
                {myInfo.youtubeUrl && <a href={myInfo.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#777' }} title="유튜브"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/></svg></a>}
                {myInfo.instagramUrl && <a href={myInfo.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#777' }} title="인스타"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>}
                {myInfo.facebookUrl && <a href={myInfo.facebookUrl} target="_blank" rel="noreferrer" style={{ color: '#777' }} title="페이스북"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>}
                {myInfo.tiktokUrl && <a href={myInfo.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#777' }} title="틱톡"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>}
              </div>
            )}
          </div>

          {/* 통계 - 우측 */}
          <div className="seller-dashboard-stats">
            <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>{myProducts.length}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', fontWeight: '600' }}>등록 상품</div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#ffd6e0' }}></div>
            {myInfo && myInfo.id && (
              <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/shop/${myInfo.id}`)}>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', marginTop: '4px' }}>→ 방문</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px', fontWeight: '600' }}>내 브랜드 샵</div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="mypage-content-wrapper">
        <div className="mypage-sidebar">
          <button 
            className={`mypage-nav-btn ${activeTab === 'products' ? 'active' : ''}`} 
            onClick={() => setActiveTab('products')}
          >
            내가 등록한 상품 관리
          </button>
          <button 
            className={`mypage-nav-btn ${activeTab === 'add-product' && !editingProductId ? 'active' : ''}`} 
            onClick={handleToggleForm}
            style={{ display: editingProductId ? 'none' : 'block' }}
          >
            새 상품 등록
          </button>
          {editingProductId && activeTab === 'add-product' && (
            <button className="mypage-nav-btn active">
              상품 정보 수정
            </button>
          )}
        </div>

        <div className="mypage-content-area" style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'add-product' && (
          <div className="seller-dashboard-section">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ffeef2', paddingBottom: '0.8rem' }}>
              {editingProductId ? '상품 정보 수정 ' : '새 상품 등록 (SlimeHub 전용)'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* 2. 상품 수동 상세 작성 및 업로드 */}
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 상단 2단 레이아웃: 실제 상품 상세페이지와 유사한 배치 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                  
                  {/* 좌측: 대표 이미지 썸네일 (크게) */}
                  <div className="seller-form-box" style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>상품 대표 이미지</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>{imageUrls.length} / 5</span>
                    </div>

                    <label htmlFor="image-file-input" style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed #ffeef2', borderRadius: '16px', padding: '3rem 1rem', cursor: 'pointer',
                      background: '#fffafb', transition: 'all 0.2s ease', gap: '0.8rem'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ffeef2'; e.currentTarget.style.borderColor = 'var(--primary-color)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fffafb'; e.currentTarget.style.borderColor = '#ffeef2' }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>클릭하여 이미지 업로드</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{uploadingImg ? '업로드 중...' : '최대 5장 선택 (첫 번째가 대표 이미지)'}</span>
                    </label>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="image-file-input" disabled={imageUrls.length >= 5} />

                    {imageUrls.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
                        {imageUrls.map((url, index) => (
                          <div key={index} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#ff4d4f', border: '1px solid #ff4d4f', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}>✕</button>
                            {index === 0 && <div style={{ position: 'absolute', bottom: '0', width: '100%', background: 'rgba(255, 107, 142, 0.9)', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px 0', fontWeight: 'bold', letterSpacing: '1px' }}>대표</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 우측: 상품 기본 정보 및 가격 (구매 버튼 영역, 작게) */}
                  <div className="seller-form-box" style={{ flex: '1 1 350px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', borderBottom: '2px solid #ffeef2', paddingBottom: '0.8rem', margin: '0 0 1rem 0' }}>📋 상품 기본 정보</h4>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>카테고리 *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                        <option value="슬라임">슬라임</option>
                        <option value="슬랑이">슬랑이</option>
                        <option value="말링이">말랑이</option>
                        <option value="스퀴시">스퀴시</option>
                      </select>
                    </div>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>상품명 *</label>
                      <input type="text" name="name" placeholder="예: 구름 슬라임" required value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>판매가 (원)</label>
                      <input type="number" name="price" placeholder="숫자만 입력" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>



                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>질감</label>
                      <input type="text" name="texture" placeholder="예: 크런치, 클리어" value={formData.texture} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>

                    <div className="seller-form-row align-start">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '8px' }}>해시태그</label>
                      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '16px', minHeight: '44px', alignItems: 'center', backgroundColor: '#fff' }}>
                        {tagsList.map((tag, idx) => (
                          <span key={idx} style={{ background: '#fef1f8', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            #{tag}
                            <button type="button" onClick={() => setTagsList(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ff70a0', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>×</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder={tagsList.length < 5 ? "스페이스바/엔터로 추가" : "최대 5개까지 가능"}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              const val = tagInput.trim().replace(/^#/, '');
                              if (val && !tagsList.includes(val) && tagsList.length < 5) {
                                setTagsList(prev => [...prev, val]);
                                setTagInput('');
                              } else if (tagsList.length >= 5) {
                                alert('해시태그는 최대 5개까지만 등록할 수 있습니다.');
                              }
                            } else if (e.key === 'Backspace' && tagInput === '' && tagsList.length > 0) {
                              setTagsList(prev => prev.slice(0, -1));
                            }
                          }}
                          disabled={tagsList.length >= 5}
                          style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', fontSize: '0.9rem', background: 'transparent' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                      <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>스토어 구매 링크 *</label>
                      <input type="text" name="purchaseUrl" placeholder="실제 판매 쇼핑몰 URL" required value={formData.purchaseUrl} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                </div>

                {/* 하단: 상세 설명 및 미디어 (긴 세로 레이아웃) */}
                <div className="seller-form-box">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', borderBottom: '2px solid #ffeef2', paddingBottom: '0.8rem', margin: 0 }}>상세 설명 (텍스트 & 추가 미디어)</h4>
<br></br>
                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>텍스트 설명</label>
                    <br></br>
                    <textarea name="description" placeholder="플레이 촉감이나 슬라임 특성을 자세하게 적어주시면 구매 결정에 큰 도움이 됩니다!" value={formData.description} onChange={handleInputChange} style={{ width: '100%', minHeight: '180px', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }} />
                  </div>
<br></br>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>상세 이미지 첨부 (최대 15개, 선택)</label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{descriptionImageUrls.length}/15개 등록됨</span>
                    </div>
                    
                    {descriptionImageUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {descriptionImageUrls.map((url, index) => (
                          <div key={index} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={url} alt={`preview-desc-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setDescriptionImageUrls(prev => prev.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/*" multiple onChange={handleDescImageUpload} style={{ display: 'none' }} id="desc-image-file-input" disabled={descriptionImageUrls.length >= 15} />
                      <label htmlFor="desc-image-file-input" style={{ padding: '0.8rem 1.2rem', background: descriptionImageUrls.length >= 15 ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${descriptionImageUrls.length >= 15 ? 'var(--border-color)' : 'var(--primary-color)'}`, color: descriptionImageUrls.length >= 15 ? 'var(--text-sub)' : 'var(--primary-color)', borderRadius: '10px', fontWeight: '600', cursor: descriptionImageUrls.length >= 15 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'inline-block' }}>
                        {uploadingDescImg ? '업로드 중...' : '상세 이미지 추가하기'}
                      </label>
                    </div>
                  </div>

                  {/* 동영상 설정 */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>플레이 동영상 첨부 (선택)</label>
                    <div className="seller-radio-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'NONE' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'NONE' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '16px', color: mediaOption === 'NONE' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'NONE' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'NONE'} onChange={() => { setMediaOption('NONE'); setFormData(prev => ({ ...prev, videoUrl: '', videoType: 'NONE' })) }} style={{ display: 'none' }} />
                        사용 안 함
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'FILE' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'FILE' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '16px', color: mediaOption === 'FILE' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'FILE' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'FILE'} onChange={() => setMediaOption('FILE')} style={{ display: 'none' }} />
                        직접 올리기 (50MB↓)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'LINK' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'LINK' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '16px', color: mediaOption === 'LINK' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'LINK' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'LINK'} onChange={() => setMediaOption('LINK')} style={{ display: 'none' }} />
                        릴스/숏츠 링크 입력
                      </label>
                    </div>

                    {mediaOption === 'FILE' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <input type="file" accept="video/*,image/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-file-input" />
                          <label htmlFor="video-file-input" style={{ padding: '0.8rem 1.2rem', background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '16px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                            {uploadingVid ? '업로드 중...' : 'PC에서 파일 선택'}
                          </label>
                          {formData.videoUrl && <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>✓ 첨부 완료</span>}
                        </div>
                        {formData.videoUrl && (
                          <div style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            {formData.videoUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                              <img src={formData.videoUrl} alt="media preview" style={{ width: '100%', display: 'block' }} />
                            ) : (
                              <video src={formData.videoUrl} controls style={{ width: '100%', display: 'block' }} />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {mediaOption === 'LINK' && (
                      <input type="text" name="videoUrl" placeholder="동영상 주소를 복사해서 붙여넣으세요" value={formData.videoUrl} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="submit-btn" disabled={uploadingImg || uploadingVid || uploadingDescImg} style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 4px 16px rgba(255,107,158,0.25)' }}>
                    {uploadingImg || uploadingVid ? '미디어 업로드 중...' : editingProductId ? '수정 완료하기' : '상품 등록 완료'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          )}

          {activeTab === 'products' && (
            <div className="seller-dashboard-card">
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #ffeef2', paddingBottom: '0.8rem' }}>내가 등록한 상품 관리</h3>
              
              {/* Category Filters & Sort */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setFilterCategory('전체')}
                    style={{ padding: '6px 14px', background: filterCategory === '전체' ? '#333' : '#f0f0f0', color: filterCategory === '전체' ? '#fff' : '#555', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    전체 {myProducts.length}
                  </button>
                  {['슬라임', '슬랑이', '말링이', '스퀴시'].map(cat => {
                    const count = myProducts.filter(p => p.category === cat).length;
                    if (count === 0) return null;
                    const isActive = filterCategory === cat;
                    return (
                      <button 
                        key={cat} 
                        onClick={() => setFilterCategory(cat)}
                        style={{ padding: '6px 14px', background: isActive ? 'var(--primary-color)' : '#fff', color: isActive ? '#fff' : 'var(--primary-color)', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold', border: isActive ? '1px solid var(--primary-color)' : '1px solid #ffccd8', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                      {cat} {count}
                      </button>
                    );
                  })}
                </div>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #ccc', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', background: '#fff' }}
                >
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>

              {myProducts.length === 0 ? (
                <div className="empty-state">아직 등록한 상품이 없어요! 첫 상품을 등록해보세요.</div>
              ) : (() => {
                const filteredProducts = myProducts
                  .filter(p => filterCategory === '전체' || p.category === filterCategory)
                  .sort((a, b) => {
                    if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
                    return b.id - a.id;
                  });
                  
                return (
                  <div className="seller-products-grid">
                    {filteredProducts.map(p => (
                    <div key={p.id} className="seller-product-card" style={{ position: 'relative', borderRadius: '0px', overflow: 'hidden', border: '1px solid #eee', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <Link to={`/product/${p.id}`} style={{ display: 'flex', flexDirection: 'column', flex: 1, textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f8f8f8' }}>
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '4px' }}>{p.category || '기타'}</div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                            <div style={{ fontWeight: 'bold', color: '#111' }}>{p.price ? `${p.price.toLocaleString()}원` : '가격 미정'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#666' }}>
                              <span style={{ color: '#ffb400' }}>★</span> <span style={{ fontWeight: 'bold' }}>{p.avgRating ? p.avgRating.toFixed(1) : '0.0'}</span> ({p.reviewCount || 0})
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Management Buttons */}
                      <div style={{ display: 'flex', borderTop: '1px solid #eee', marginTop: 'auto' }}>
                        <button 
                          onClick={() => handleEditClick(p)}
                          style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', borderRight: '1px solid #eee', cursor: 'pointer', fontWeight: 'bold', color: '#555', transition: 'background 0.2s', fontSize: '0.9rem' }}
                          onMouseEnter={e => e.target.style.background = '#f8f9fa'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                          수정 
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          style={{ flex: 1, padding: '12px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#ff3b30', transition: 'background 0.2s', fontSize: '0.9rem' }}
                          onMouseEnter={e => e.target.style.background = '#fff5f5'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                          삭제 
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
