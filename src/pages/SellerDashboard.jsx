import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'

export default function SellerDashboard() {
  const { token, role, nickname } = useAuthStore()
  const navigate = useNavigate()
  
  const [myProducts, setMyProducts] = useState([])
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
    capacity: '',
    texture: '',
    scent: '',
    color: '',
    releaseDate: '',
    description: '',
    shopName: '',
    purchaseUrl: '',
    tags: '',
    videoUrl: '',
    videoType: 'NONE'
  })

  useEffect(() => {
    if (role !== 'SELLER') {
      alert('판매자만 접근 가능합니다.')
      navigate('/')
      return
    }
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
    if (showForm) {
      // Clear form on close
      setFormData({ name: '', price: '', capacity: '', texture: '', scent: '', color: '', releaseDate: '', description: '', shopName: '', purchaseUrl: '', tags: '', videoUrl: '', videoType: 'NONE' });
      setImageUrls([]);
      setDescriptionImageUrls([]);
      setMediaOption('NONE');
      setEditingProductId(null);
    }
    setShowForm(!showForm);
  }

  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    setFormData({
      name: p.name || '',
      price: p.price ? p.price.toString() : '',
      capacity: p.capacity ? p.capacity.toString() : '',
      texture: p.texture || '',
      scent: p.scent || '',
      color: p.color || '',
      releaseDate: p.releaseDate || '',
      description: p.description || '',
      shopName: p.shopName || '',
      purchaseUrl: p.purchaseUrl || '',
      tags: p.tags ? p.tags.join(', ') : '',
      videoUrl: p.videoUrl || '',
      videoType: p.videoType || 'NONE'
    });
    setImageUrls(p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [p.imageUrl]);
    setDescriptionImageUrls(p.descriptionImageUrls || []);
    setMediaOption(p.videoType || 'NONE');
    setShowForm(true);
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
    if (descriptionImageUrls.length + files.length > 5) {
      alert('상세 설명 이미지는 최대 5개까지만 등록할 수 있습니다.');
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      alert('최소 1개 이상의 대표 이미지를 등록해야 합니다.');
      return;
    }

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
        capacity: parseInt(formData.capacity) || 0,
        releaseDate: formData.releaseDate ? formData.releaseDate : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };

      if (editingProductId) {
        await productApi.updateProduct(editingProductId, productPayload);
        alert('상품이 성공적으로 수정되었습니다. ✏️');
      } else {
        await productApi.createProduct(productPayload);
        alert('상품이 성공적으로 등록되었습니다. 🎉');
      }

      setFormData({ name: '', price: '', capacity: '', texture: '', scent: '', color: '', releaseDate: '', description: '', shopName: '', purchaseUrl: '', tags: '', videoUrl: '', videoType: 'NONE' });
      setImageUrls([]);
      setDescriptionImageUrls([]);
      setMediaOption('NONE');
      setEditingProductId(null);
      setShowForm(false);
      fetchMyProducts();
    } catch (err) {
      alert(err.message || '요청 처리에 실패했습니다.');
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
    <div className="admin-container">
      <h2>판매자 센터 🏢</h2>
      <p style={{marginBottom: '2rem'}}>환영합니다, <strong>{nickname}</strong> 사장님! 여기서 등록하신 슬라임들을 관리하세요.</p>

      <div className="seller-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>내가 등록한 슬라임 관리</h3>
          <button className="nav-btn admin-btn" onClick={handleToggleForm}>
            {showForm ? '닫기' : '+ 새 상품 등록'}
          </button>
        </div>

        {showForm && (
          <div className="product-add-section" style={{ border: '2px solid var(--primary-color)', padding: '2rem', borderRadius: '16px', backgroundColor: '#fffcfd' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ffd6e0', paddingBottom: '0.8rem' }}>
              {editingProductId ? '상품 정보 수정 ✏️' : '새 상품 등록 (SlimeHub 전용)'}
            </h3>
            
            {/* 1. URL 자동 완성 (Jsoup 기반 메타데이터 파서 - 등록 모드일 때만 노출) */}
            {!editingProductId && (
              <div style={{ marginBottom: '1.8rem', padding: '1.2rem', background: '#fff0f3', borderRadius: '12px', border: '1px solid #ffd6e0' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', display: 'block', marginBottom: '8px' }}>
                  🔗 스토어 주소로 정보 가져오기 (자동완성)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="네이버 스마트스토어, 카페24 등의 상품 주소 URL을 입력해 보세요!" 
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #ffd6e0', outline: 'none' }}
                  />
                  <button 
                    type="button" 
                    className="submit-btn" 
                    onClick={handleCrawl}
                    disabled={isCrawling}
                    style={{ width: '120px', padding: '10px', marginTop: 0 }}
                  >
                    {isCrawling ? '가져오는 중...' : '정보 가져오기'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. 상품 수동 상세 작성 및 업로드 */}
            <form onSubmit={handleAddProduct} className="product-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>상품명 *</label>
                  <input type="text" name="name" placeholder="예: 구름 슬라임" required value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>스토어명 *</label>
                  <input type="text" name="shopName" placeholder="예: 슬라임 팩토리" required value={formData.shopName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>판매가 (원)</label>
                  <input type="number" name="price" placeholder="가격 입력" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>용량 (ml)</label>
                  <input type="number" name="capacity" placeholder="용량 입력" value={formData.capacity} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>질감</label>
                  <input type="text" name="texture" placeholder="예: 크런치" value={formData.texture} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>향</label>
                  <input type="text" name="scent" placeholder="예: 초콜릿향" value={formData.scent} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>색상</label>
                  <input type="text" name="color" placeholder="예: 화이트" value={formData.color} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>출시일</label>
                <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>

              {/* 3. 이미지 미디어 설정 (수동 주소입력 및 다중 파일 업로드 - 최대 5개) */}
              <div style={{ padding: '1.2rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>🖼️ 대표 이미지 등록 (최대 5개)</label>
                
                {/* 현재 등록된 이미지 목록 미리보기 카드 그리드 */}
                {imageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {imageUrls.map((url, index) => (
                      <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          X
                        </button>
                        <div style={{ position: 'absolute', bottom: '0', width: '100%', background: 'rgba(255,255,255,0.8)', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {index === 0 ? '대표' : `${index + 1}번`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                      id="image-file-input"
                      disabled={imageUrls.length >= 5}
                    />
                    <label htmlFor="image-file-input" className="submit-btn" style={{ width: 'auto', padding: '8px 16px', background: imageUrls.length >= 5 ? '#eee' : '#fff', border: '1px solid #ffd6e0', color: imageUrls.length >= 5 ? '#999' : 'var(--primary-color)', margin: 0, display: 'inline-block', cursor: imageUrls.length >= 5 ? 'not-allowed' : 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                      {uploadingImg ? '업로드 중...' : '📷 PC에서 이미지 추가 (다중 선택 가능)'}
                    </label>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      ({imageUrls.length}/5개 등록 완료)
                    </span>
                  </div>

                  {/* 수동 URL 입력창 */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                    <input 
                      type="text" 
                      id="manual-image-url-input"
                      placeholder="혹은 이미지 웹 URL 주소를 적고 추가 버튼을 누르세요." 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val) {
                            if (imageUrls.length >= 5) {
                              alert('대표 이미지는 최대 5개까지만 등록할 수 있습니다.');
                              return;
                            }
                            setImageUrls(prev => [...prev, val]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={{ width: '80px', padding: '10px', background: '#fff', border: '1px solid #ffd6e0', color: 'var(--primary-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => {
                        const input = document.getElementById('manual-image-url-input');
                        const val = input.value.trim();
                        if (val) {
                          if (imageUrls.length >= 5) {
                            alert('대표 이미지는 최대 5개까지만 등록할 수 있습니다.');
                            return;
                          }
                          setImageUrls(prev => [...prev, val]);
                          input.value = '';
                        } else {
                          alert('URL 주소를 입력해주세요.');
                        }
                      }}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. 동영상 미디어 설정 (업로드 vs 유튜브/인스타 링크) */}
              <div style={{ padding: '1.2rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📹 촉감 동영상 추가 (선택사항)</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" checked={mediaOption === 'NONE'} onChange={() => { setMediaOption('NONE'); setFormData(prev => ({ ...prev, videoUrl: '', videoType: 'NONE' })) }} />
                    영상 등록 안함
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" checked={mediaOption === 'FILE'} onChange={() => setMediaOption('FILE')} />
                    짧은 영상 파일 직접 업로드
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" checked={mediaOption === 'LINK'} onChange={() => setMediaOption('LINK')} />
                    외부 영상 링크 첨부 (유튜브/인스타)
                  </label>
                </div>

                {mediaOption === 'FILE' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '10px' }}>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload} 
                      style={{ display: 'none' }} 
                      id="video-file-input"
                    />
                    <label htmlFor="video-file-input" className="submit-btn" style={{ width: 'auto', padding: '8px 16px', background: '#fff', border: '1px solid #ffd6e0', color: 'var(--primary-color)', margin: 0, display: 'inline-block', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                      {uploadingVid ? '동영상 업로드 중...' : '🎥 짧은 비디오 선택 (15MB 이하)'}
                    </label>
                    {formData.videoUrl && <span style={{ fontSize: '0.8rem', color: 'green', fontWeight: 'bold' }}>✓ 동영상 등록 완료!</span>}
                  </div>
                )}

                {mediaOption === 'LINK' && (
                  <input 
                    type="text" 
                    name="videoUrl" 
                    placeholder="유튜브 영상 주소 또는 인스타그램 게시글 주소를 여기에 붙여넣어 주세요." 
                    value={formData.videoUrl} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }} 
                  />
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>공식 스토어 구매 링크 URL (네이버 쇼핑 등) *</label>
                <input type="text" name="purchaseUrl" placeholder="예: https://smartstore.naver.com/..." required value={formData.purchaseUrl} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>태그</label>
                <input type="text" name="tags" placeholder="쉼표로 구분. 예: 촉촉함, 기포소리대박, 초보자용" value={formData.tags} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>상세 설명</label>
                <textarea name="description" placeholder="플레이 촉감이나 슬라임 특성을 자세히 설명해 주세요." value={formData.description} onChange={handleInputChange} style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
              </div>

              {/* 상세 설명 이미지 파일 업로드 */}
              <div style={{ padding: '1.2rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📄 상세 설명 이미지 등록 (최대 5개, 선택사항)</label>
                
                {/* 현재 등록된 상세 이미지 목록 미리보기 카드 그리드 */}
                {descriptionImageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {descriptionImageUrls.map((url, index) => (
                      <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={url} alt={`preview-desc-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => setDescriptionImageUrls(prev => prev.filter((_, i) => i !== index))}
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          X
                        </button>
                        <div style={{ position: 'absolute', bottom: '0', width: '100%', background: 'rgba(255,255,255,0.8)', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {`${index + 1}번 상세`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleDescImageUpload} 
                    style={{ display: 'none' }} 
                    id="desc-image-file-input"
                    disabled={descriptionImageUrls.length >= 5}
                  />
                  <label htmlFor="desc-image-file-input" className="submit-btn" style={{ width: 'auto', padding: '8px 16px', background: descriptionImageUrls.length >= 5 ? '#eee' : '#fff', border: '1px solid #ffd6e0', color: descriptionImageUrls.length >= 5 ? '#999' : 'var(--primary-color)', margin: 0, display: 'inline-block', cursor: descriptionImageUrls.length >= 5 ? 'not-allowed' : 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>
                    {uploadingDescImg ? '업로드 중...' : '📷 PC에서 상세 이미지 추가 (다중 선택 가능)'}
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    ({descriptionImageUrls.length}/5개 등록 완료)
                  </span>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={uploadingImg || uploadingVid || uploadingDescImg} style={{ padding: '14px', fontSize: '1rem', marginTop: '1rem' }}>
                {uploadingImg || uploadingVid ? '미디어 업로드 중...' : editingProductId ? '상품 정보 수정 완료하기' : '상품 등록하기'}
              </button>
            </form>
          </div>
        )}

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
                  <th>출시일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.imageUrl} alt={p.name} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} /></td>
                    <td><Link to={`/product/${p.id}`} style={{fontWeight:'600'}}>{p.name}</Link></td>
                    <td>{p.price ? `${p.price.toLocaleString()}원` : '정보 없음'}</td>
                    <td>{p.releaseDate || '-'}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditClick(p)} style={{ marginRight: '6px', background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>수정</button>
                      <button className="btn-danger" onClick={() => handleDeleteProduct(p.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
