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

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    texture: '',
    description: '',
    shopName: '',
    purchaseUrl: '',
    tags: '',
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
    fetchMyReviews()
  }, [role])

  const fetchMyReviews = async () => {
    try {
      const data = await reviewApi.getSellerReviews();
      setMyReviews(data);
    } catch (err) {
      console.error(err);
    }
  }

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
    setFormData({ name: '', price: '', texture: '', description: '', shopName: '', purchaseUrl: '', tags: '', videoUrl: '', videoType: 'NONE', category: 'SLIME' });
    setImageUrls([]);
    setDescriptionImageUrls([]);
    setMediaOption('NONE');
    setEditingProductId(null);
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
      tags: p.tags ? p.tags.join(', ') : '',
      videoUrl: p.videoUrl || '',
      videoType: p.videoType || 'NONE',
      category: p.category || 'SLIME'
    });
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
      alert('선택한 대표 이미지 업로드 완료! ✨');
    } catch (err) {
      alert('이미지 업로드에 실패했습니다. 파일 크기가 너무 크거나 서버 연결이 불안정할 수 있습니다.');
    } finally {
      setUploadingImg(false);
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Limit video size to 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert('슬라임 재생 동영상은 15MB 이하의 짧은 영상만 등록 가능합니다.');
      return;
    }

    try {
      setUploadingVid(true);
      const res = await boardApi.uploadFile(file, 'product-video');
      setFormData(prev => ({ ...prev, videoUrl: res.url, videoType: 'FILE' }));
      alert('슬라임 동영상 업로드 완료! 🧪');
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
      alert('선택한 상세 이미지 업로드 완료! ✨');
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
      alert('상품 정보 자동완성 완료! (스토어 메타데이터 추출 완료) ✨');
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
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        category: formData.category || 'SLIME'
      };

      if (editingProductId) {
        await productApi.updateProduct(editingProductId, productPayload);
        alert('상품이 성공적으로 수정되었습니다. ✏️');
      } else {
        await productApi.createProduct(productPayload);
        alert('상품이 성공적으로 등록되었습니다. 🎉');
      }

      setFormData({ name: '', price: '', texture: '', description: '', shopName: '', purchaseUrl: '', tags: '', videoUrl: '', videoType: 'NONE', category: 'SLIME' });
      setImageUrls([]);
      setDescriptionImageUrls([]);
      setMediaOption('NONE');
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
      {/* 1. Seller Banner */}
      <div className="mypage-banner">
        <div className="mypage-banner-content seller-dashboard-banner">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="profile-avatar-container" style={{ position: 'relative', display: 'inline-block', width: '85px', height: '85px', flexShrink: 0 }}>
              <div className="profile-avatar" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '2rem', fontWeight: 'bold' }}>
                {myInfo?.profileImageUrl ? (
                  <img src={myInfo.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  nickname ? nickname.charAt(0).toUpperCase() : 'U'
                )}
              </div>
            </div>
            <div className="profile-info-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', minWidth: 0, textAlign: 'left' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', whiteSpace: 'nowrap' }}>판매자 센터</h2>
              <div className="profile-details-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="role-badge" style={{ margin: 0, display: 'inline-block', flexShrink: 0 }}>
                  슬라임 판매자
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  {nickname} 사장님, 환영합니다!
                </span>
                {myInfo && myInfo.id && (
                  <button 
                    onClick={() => navigate(`/shop/${myInfo.id}`)}
                    style={{ marginLeft: '10px', padding: '6px 14px', fontSize: '0.85rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(255, 32, 112, 0.2)' }}
                  >
                    내 브랜드 샵 보기 ➔
                  </button>
                )}
              </div>
              {myInfo && (
                <div className="profile-sns-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {myInfo.siteUrl && (
                    <a href={myInfo.siteUrl} target="_blank" rel="noreferrer" style={{ color: '#555' }} title="쇼핑몰 사이트">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </a>
                  )}
                  {myInfo.youtubeUrl && (
                    <a href={myInfo.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#555' }} title="유튜브">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/></svg>
                    </a>
                  )}
                  {myInfo.instagramUrl && (
                    <a href={myInfo.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#555' }} title="인스타그램">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                  )}
                  {myInfo.facebookUrl && (
                    <a href={myInfo.facebookUrl} target="_blank" rel="noreferrer" style={{ color: '#555' }} title="페이스북">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                  )}
                  {myInfo.tiktokUrl && (
                    <a href={myInfo.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#555' }} title="틱톡">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="seller-dashboard-stats">
            <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>{myProducts.length}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', fontWeight: '600' }}>등록된 상품</div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#ffd6e0' }}></div>
            <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reviews')}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>{myReviews.length}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', fontWeight: '600' }}>내 리뷰 내역</div>
            </div>
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
            className={`mypage-nav-btn ${activeTab === 'add-product' ? 'active' : ''}`} 
            onClick={handleToggleForm}
          >
            새 상품 등록
          </button>
          <button 
            className={`mypage-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reviews')}
          >
            내 상품 리뷰 관리
          </button>
        </div>

        <div className="mypage-content-area" style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'add-product' && (
          <div className="seller-dashboard-section">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ffd6e0', paddingBottom: '0.8rem' }}>
              {editingProductId ? '상품 정보 수정 ✏️' : '새 상품 등록 (SlimeHub 전용)'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* 1. URL 자동 완성 */}
              {!editingProductId && (
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    스토어 주소로 상품 정보 불러오기
                  </label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>네이버 스마트스토어 등 기존 판매처의 URL을 입력하면 상품 정보가 자동으로 채워집니다.</p>
                  <div className="url-autocomplete-row">
                    <input 
                      type="text" 
                      placeholder="상품 주소 URL을 입력해 주세요." 
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button 
                      type="button" 
                      className="nav-btn admin-btn" 
                      onClick={handleCrawl}
                      disabled={isCrawling}
                      style={{ padding: '0 1.5rem', margin: 0, height: 'auto' }}
                    >
                      {isCrawling ? '가져오는 중...' : '자동 완성하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. 상품 수동 상세 작성 및 업로드 */}
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 상단 2단 레이아웃: 실제 상품 상세페이지와 유사한 배치 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                  
                  {/* 좌측: 대표 이미지 썸네일 */}
                  <div className="seller-form-box">
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', borderBottom: '2px solid #ffd6e0', paddingBottom: '0.8rem', margin: 0 }}>📸 대표 이미지 썸네일</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>최대 5개 *</label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{imageUrls.length}/5개</span>
                    </div>
                    
                    {imageUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {imageUrls.map((url, index) => (
                          <div key={index} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                            {index === 0 && <div style={{ position: 'absolute', bottom: '0', width: '100%', background: 'var(--primary-color)', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>대표</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="image-file-input" disabled={imageUrls.length >= 5} />
                      <label htmlFor="image-file-input" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', background: imageUrls.length >= 5 ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${imageUrls.length >= 5 ? 'var(--border-color)' : 'var(--primary-color)'}`, color: imageUrls.length >= 5 ? 'var(--text-sub)' : 'var(--primary-color)', borderRadius: '10px', fontWeight: '600', cursor: imageUrls.length >= 5 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                        {uploadingImg ? '업로드 중...' : 'PC에서 이미지 추가'}
                      </label>
                    </div>
                    <div style={{ display: 'flex', width: '100%' }}>
                      <input type="text" id="manual-image-url-input" placeholder="이미지 URL 직접 추가" style={{ flex: 1, padding: '0.8rem 1rem', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                      <button type="button" onClick={() => {
                          const input = document.getElementById('manual-image-url-input');
                          const val = input.value.trim();
                          if (val) {
                            if (imageUrls.length >= 5) { alert('최대 5개까지만 등록할 수 있습니다.'); return; }
                            setImageUrls(prev => [...prev, val]);
                            input.value = '';
                          }
                        }}
                        style={{ padding: '0 1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: 'none', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', color: 'var(--text-main)', fontWeight: '600', cursor: 'pointer' }}>
                        추가
                      </button>
                    </div>
                  </div>

                  {/* 우측: 상품 기본 정보 및 가격 (구매 버튼 영역) */}
                  <div className="seller-form-box">
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', borderBottom: '2px solid #ffd6e0', paddingBottom: '0.8rem', margin: 0 }}>📋 상품 기본 정보</h4>
                                          <br></br>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>카테고리 *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                        <option value="SLIME">슬라임</option>
                        <option value="SLANGY">슬랑이</option>
                        <option value="MALLANGI">말랑이</option>
                        <option value="SQUISHY">스퀴시</option>
                      </select>
                    </div>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>상품명 *</label>
                      <input type="text" name="name" placeholder="예: 구름 슬라임" required value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>

                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>판매가 (원)</label>
                      <input type="number" name="price" placeholder="숫자만 입력" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>



                    <div className="seller-form-row">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>질감</label>
                      <input type="text" name="texture" placeholder="예: 크런치, 클리어" value={formData.texture} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>

                    <div className="seller-form-row align-start">
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '8px' }}>해시태그</label>
                      <input type="text" name="tags" placeholder="쉼표(,)로 구분 (예: 폼슬라임)" value={formData.tags} onChange={handleInputChange} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                      <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>스토어 구매 링크 *</label>
                      <input type="text" name="purchaseUrl" placeholder="실제 판매 쇼핑몰 URL" required value={formData.purchaseUrl} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }} />
                    </div>
                  </div>
                </div>

                {/* 하단: 상세 설명 및 미디어 (긴 세로 레이아웃) */}
                <div className="seller-form-box">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', borderBottom: '2px solid #ffd6e0', paddingBottom: '0.8rem', margin: 0 }}>상세 설명 (텍스트 & 추가 미디어)</h4>
<br></br>
                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>텍스트 설명</label>
                    <br></br>
                    <textarea name="description" placeholder="플레이 촉감이나 슬라임 특성을 자세하게 적어주시면 구매 결정에 큰 도움이 됩니다!" value={formData.description} onChange={handleInputChange} style={{ width: '100%', minHeight: '180px', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }} />
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
                    <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>📹 플레이 동영상 첨부 (선택)</label>
                    <div className="seller-radio-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'NONE' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'NONE' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '10px', color: mediaOption === 'NONE' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'NONE' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'NONE'} onChange={() => { setMediaOption('NONE'); setFormData(prev => ({ ...prev, videoUrl: '', videoType: 'NONE' })) }} style={{ display: 'none' }} />
                        사용 안 함
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'FILE' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'FILE' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '10px', color: mediaOption === 'FILE' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'FILE' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'FILE'} onChange={() => setMediaOption('FILE')} style={{ display: 'none' }} />
                        직접 올리기 (15MB↓)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '0.6rem 1rem', background: mediaOption === 'LINK' ? 'var(--bg-secondary)' : '#fff', border: `1px solid ${mediaOption === 'LINK' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '10px', color: mediaOption === 'LINK' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: mediaOption === 'LINK' ? '600' : 'normal' }}>
                        <input type="radio" checked={mediaOption === 'LINK'} onChange={() => setMediaOption('LINK')} style={{ display: 'none' }} />
                        릴스/숏츠 링크 입력
                      </label>
                    </div>

                    {mediaOption === 'FILE' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-file-input" />
                        <label htmlFor="video-file-input" style={{ padding: '0.8rem 1.2rem', background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                          {uploadingVid ? '업로드 중...' : 'PC에서 동영상 선택'}
                        </label>
                        {formData.videoUrl && <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>✓ 첨부 완료</span>}
                      </div>
                    )}
                    {mediaOption === 'LINK' && (
                      <input type="text" name="videoUrl" placeholder="동영상 주소를 복사해서 붙여넣으세요" value={formData.videoUrl} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }} />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="submit-btn" disabled={uploadingImg || uploadingVid || uploadingDescImg} style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 4px 16px rgba(255,107,158,0.25)' }}>
                    {uploadingImg || uploadingVid ? '미디어 업로드 중...' : editingProductId ? '수정 완료하기' : '상품 등록 완료'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          )}

          {activeTab === 'products' && (
            <div className="seller-dashboard-card">
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #ffd6e0', paddingBottom: '0.8rem' }}>내가 등록한 슬라임 관리</h3>
              {myProducts.length === 0 ? (
                <div className="empty-state">아직 등록한 슬라임이 없어요! 첫 상품을 등록해보세요.</div>
              ) : (
                <div className="admin-table-container" style={{overflowX: 'auto'}}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>상품 이미지</th>
                        <th>상품명</th>
                        <th>가격</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.map(p => (
                        <tr key={p.id}>
                          <td><img src={p.imageUrl} alt={p.name} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} /></td>
                          <td><Link to={`/product/${p.id}`} style={{fontWeight:'600'}}>{p.name}</Link></td>
                          <td>{p.price ? `${p.price.toLocaleString()}원` : '정보 없음'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minWidth: '90px' }}>
                              <button onClick={() => handleEditClick(p)} style={{ flex: 1, background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>수정</button>
                              <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, background: '#ffe5e5', color: '#ff4d4d', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>삭제</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="seller-dashboard-card">
            <h3 style={{ marginBottom: '1.5rem' }}>내 상품 리뷰 관리</h3>
            <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              고객들이 작성한 리뷰를 확인하세요.
            </p>
            
            {myReviews.length === 0 ? (
              <div className="empty-state">등록된 리뷰가 없습니다.</div>
            ) : (
              <div className="admin-table-container" style={{overflowX: 'auto'}}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>별점</th>
                      <th>리뷰 내용</th>
                      <th>작성자</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReviews.map(r => (
                      <tr key={r.id}>
                        <td><Link to={`/product/${r.productId}`}>{r.productName}</Link></td>
                        <td>{'⭐'.repeat(r.rating)}</td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {r.content}
                          {r.imageUrl && <div style={{marginTop:'0.5rem'}}><img src={r.imageUrl} alt="review" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'8px'}} /></div>}
                        </td>
                        <td>{r.nickname}</td>
                        <td>
                          {r.isHidden ? (
                            <span style={{ color: '#ff3b30', fontWeight: 'bold', background: '#ffeef0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>블라인드</span>
                          ) : (
                            <span style={{ color: '#34c759', fontWeight: 'bold', background: '#e8f8ec', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>정상</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
