import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { productApi } from '../../api/products'
import { reviewApi } from '../../api/reviews'
import { authApi } from '../../api/auth'
import { boardApi } from '../../api/board'
import { Heart, Star, Share2, AlertTriangle, Plus, Minus, Bookmark } from 'lucide-react'
import ReviewSection from '../../components/ReviewSection'

function getYoutubeId(url) {
  if (!url) return null;
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts[1]) {
      return parts[1].split(/[?#&]/)[0];
    }
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getInstagramEmbedUrl(url) {
  if (!url) return '';
  let cleanUrl = url.split('?')[0];
  if (!cleanUrl.endsWith('/')) {
    cleanUrl += '/';
  }
  return `${cleanUrl}embed/`;
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuthStore()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detail')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sellerInfo, setSellerInfo] = useState(null)
  
  const images = product && product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : product ? [product.imageUrl] : []
  
  const [reviews, setReviews] = useState([])
  const [isWished, setIsWished] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    if (token) checkWishStatus()
  }, [id, token])

  const scrollToHash = () => {
    const currentHash = window.location.hash || location.hash;
    if (currentHash) {
      const hashId = currentHash.replace('#', '');
      const element = document.getElementById(hashId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1200);
      }
    }
  };

  useEffect(() => {
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [reviews, location.hash, product]);

  const fetchProduct = async () => {
    try {
      const data = await productApi.getProductDetail(id);
      setProduct(data);
      if (data.sellerId) {
        authApi.getSellerProfile(data.sellerId).then(sellerData => {
          setSellerInfo(sellerData);
        }).catch(err => console.error("Seller profile fetch error", err));
      }
    } catch (err) {
      alert('상품을 찾을 수 없습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  const fetchReviews = async () => {
    try {
      const data = await reviewApi.getProductReviews(id);
      setReviews(data.content || []);
    } catch (err) {
      console.error(err);
    }
  }

  const checkWishStatus = async () => {
    try {
      const list = await productApi.getWishlist();
      setIsWished(list.some(p => p.id === parseInt(id)));
    } catch (err) {}
  }

  const toggleWish = async () => {
    if (!token) return alert('로그인이 필요합니다.');
    try {
      const res = await productApi.toggleWishlist(id);
      setIsWished(res.wished);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBrandScrap = async (e) => {
    e.stopPropagation();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    try {
      const res = await authApi.toggleBrandScrap(product.sellerId);
      setSellerInfo(prev => ({ ...prev, isScrapped: res.isScrapped }));
      alert(res.isScrapped ? '브랜드를 스크랩했습니다.' : '스크랩을 취소했습니다.');
    } catch (err) {
      alert('스크랩 처리에 실패했습니다.');
    }
  };

  const handleCopyId = () => {
    if (product) {

      navigator.clipboard.writeText(product.id.toString());

      alert('상품번호가 복사되었습니다.');

    }

  }



  if (loading) return <div className="empty-state">불러오는 중...</div>

  if (!product) return null



  // Calculate Average Rating

  const avgRating = reviews.length > 0 

    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 

    : 0



  return (

    <div className="detail-container">

      {/* 상단 뒤로가기 네비게이션 */}

      <div style={{ marginBottom: '1.5rem' }}>

        <button 

          onClick={() => navigate(-1)}

          style={{

            display: 'flex',

            alignItems: 'center',

            gap: '6px',

            fontSize: '0.9rem',

            color: '#666',

            fontWeight: '600',

            padding: '4px 8px',

            background: 'none',

            border: 'none',

            cursor: 'pointer',

            transition: 'color 0.2s',

          }}

          onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}

          onMouseLeave={(e) => e.target.style.color = '#666'}

        >

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

            <line x1="19" y1="12" x2="5" y2="12"></line>

            <polyline points="12 19 5 12 12 5"></polyline>

          </svg>

          뒤로가기

        </button>

      </div>

      

      {/* 상단 요약 영역 */}

      <div className="detail-summary">

        {/* 왼쪽: 1:1 비율 정사각형 이미지 Carousel 슬라이더 */}

        <div 

          className="product-image-wrapper" 

          style={{ 

            flex: '1', 

            maxWidth: '450px', 

            position: 'relative',

            aspectRatio: '1 / 1',

            borderRadius: '16px',

            overflow: 'hidden',

            border: '1px solid #ffeef2',

            boxShadow: '0 8px 24px rgba(255, 32, 112, 0.06)',

            backgroundColor: '#fffcfd'

          }}

        >

          {images.length > 0 && (

            <div style={{ width: '100%', height: '100%', position: 'relative' }}>

              <img 

                src={images[currentImageIndex]} 

                alt={`${product.name}-${currentImageIndex}`} 

                style={{ 

                  width: '100%', 

                  height: '100%', 

                  objectFit: 'cover',

                  transition: 'opacity 0.2s ease-in-out'

                }} 

              />



              {/* Carousel Navigation Buttons */}

              {images.length > 1 && (

                <>

                  <button 

                    type="button"

                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)) }}

                    style={{

                      position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)',

                      width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.8)',

                      border: '1px solid #ffeef2', display: 'flex', alignItems: 'center', justifyContent: 'center',

                      cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-color)',

                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 10

                    }}

                  >

                    &lt;

                  </button>

                  <button 

                    type="button"

                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)) }}

                    style={{

                      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',

                      width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.8)',

                      border: '1px solid #ffeef2', display: 'flex', alignItems: 'center', justifyContent: 'center',

                      cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-color)',

                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 10

                    }}

                  >

                    &gt;

                  </button>



                  {/* Carousel Dot Indicators */}

                  <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>

                    {images.map((_, idx) => (

                      <button

                        key={idx}

                        type="button"

                        onClick={() => setCurrentImageIndex(idx)}

                        style={{

                          width: '8px', height: '8px', borderRadius: '50%',

                          background: idx === currentImageIndex ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.5)',

                          border: 'none', padding: 0, cursor: 'pointer', transition: 'background 0.2s'

                        }}

                      />

                    ))}

                  </div>

                </>

              )}

            </div>

          )}




        </div>

        

        {/* 오른쪽: 상품 정보 & 구매 액션 */}

        <div className="detail-summary-content" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* 스토어 정보 (슬라임 핑크 스타일) */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginBottom: '8px' }}>
            <div onClick={() => navigate(`/shop/${product.sellerId}`)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {product.shopName || '일반스토어'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>&gt;</span>
            </div>
            {sellerInfo && (
              <button 
                onClick={handleBrandScrap}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                  color: sellerInfo.isScrapped ? '#ff2070' : '#888', marginLeft: '10px',
                  padding: '4px', borderRadius: '4px'
                }}
                title="브랜드 스크랩"
              >
                <Bookmark size={18} fill={sellerInfo.isScrapped ? '#ff2070' : 'none'} />
              </button>
            )}
          </div>



          {/* 상품 타이틀 */}

          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#111', margin: 0, lineHeight: '1.35', letterSpacing: '-0.5px' }}>

            {product.name}

          </h1>



          {/* 리뷰 요약 별점 */}
          <div 
            onClick={() => {
              setActiveTab('review');
              setTimeout(() => {
                const tabs = document.querySelector('.commerce-tabs');
                if (tabs) {
                  tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#333', cursor: 'pointer' }}
            title="리뷰 보기"
          >
            <span style={{ color: reviews.length > 0 ? '#ffb400' : '#ddd', fontSize: '1.1rem' }}>★</span>
            <strong style={{ fontWeight: '700' }}>{avgRating}</strong>
            <span style={{ color: '#888', textDecoration: 'underline' }}>({reviews.length}개 리뷰)</span>
          </div>

          

          {/* 가격 표시 */}

          <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #ffeef2', paddingBottom: '1.5rem', margin: '0.5rem 0 0.5rem 0' }}>

            <span style={{ fontSize: '2.3rem', fontWeight: '900', color: '#000', letterSpacing: '-1px' }}>

              {product.price.toLocaleString()}

            </span>

            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#000', marginLeft: '2px' }}>원</span>

          </div>



          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {product.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  onClick={() => navigate(`/?search=${encodeURIComponent(tag)}`)}
                  style={{ 
                    background: '#fff0f3', 
                    color: 'var(--primary-color)', 
                    padding: '0.35rem 0.7rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: '500', 
                    border: '1px solid #ffe1e7',
                    cursor: 'pointer'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}



          {/* 구매 / 찜하기 버튼 그룹 */}
          <div className="bottom-bar" style={{ display: 'flex', gap: '10px' }}>
            {/* 찜하기 버튼 */}
            <button 
              onClick={toggleWish}
              style={{
                flex: '0 0 56px',
                height: '56px',
                borderRadius: '12px',
                border: '2px solid #ffd6e0',
                background: isWished ? '#fff0f3' : '#fff',
                color: isWished ? 'var(--primary-color)' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            
            {/* 슬라임 핫핑크 그라데이션 구매버튼 */}
            <a 
              href={product.purchaseUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="buy-btn large" 
              style={{ 
                flex: '1', 
                height: '56px', 
                borderRadius: '12px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #ff5b94 100%)', 
                color: 'white', 
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(255, 32, 112, 0.2)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              구매하러 가기
            </a>

          </div>

        </div>

      </div>



      {/* 하단 상세 탭 영역 */}

      <div className="detail-bottom" style={{ marginTop: '3rem' }}>

        <div className="commerce-tabs">

          <button 

            className={`commerce-tab-btn ${activeTab === 'detail' ? 'active' : ''}`} 

            onClick={() => setActiveTab('detail')}

          >

            상세정보

          </button>

          <button 

            className={`commerce-tab-btn ${activeTab === 'review' ? 'active' : ''}`} 

            onClick={() => setActiveTab('review')}

          >

            리뷰 {reviews.length}

          </button>

        </div>



        <div className="tab-content" style={{ padding: '2.5rem 0' }}>

          {activeTab === 'detail' && (

            <div className="fade-in">

              {/* 법적 고지 면책 경고창 */}

              <div className="warning-box" style={{ background: '#fafafa', border: '1px solid #e5e5e5' }}>

                <span className="warning-icon" style={{ background: '#888' }}>i</span>

                <span style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6' }}>

                  본 플랫폼은 상품 정보만 제공하는 통신판매중개자로서 거래의 당사자가 아니며, 등록된 상품의 정보, 배송 및 일체의 거래 이행에 대한 책임은 해당 판매자에게 있습니다.

                </span>

              </div>



              {/* 상품정보 표 */}

              <div className="product-info-section">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>

                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111' }}>상품 주요 스펙</h3>

                </div>

                

                <table className="info-table">
                  <tbody>
                    <tr>
                      <th>상품명</th>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <th>판매자명</th>
                      <td>
                        <span 
                          onClick={() => navigate(`/shop/${product.sellerId}`)}
                          style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'underline' }}
                        >
                          {product.shopName || '일반스토어'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th>질감</th>
                      <td>{product.texture || '-'}</td>
                    </tr>
                  </tbody>
                </table>

              </div>



              {/* 플레이 영상 쇼케이스 (상세 정보 탭 내부로 이동) */}

              {product.videoUrl && product.videoType !== 'NONE' && (

                <div className="product-video-section" style={{ marginTop: '2.5rem', background: '#fffcfd', border: '1px solid #ffd6e0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(255, 32, 112, 0.04)' }}>

                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '800', color: 'var(--primary-color)' }}>

                    플레이 영상 📹

                  </h4>

                  <div 

                    style={{ 

                      width: '100%', 

                      maxWidth: '480px', 

                      margin: '0 auto',

                      aspectRatio: product.videoUrl.includes('instagram.com') ? '1 / 1.25' : '16 / 9', 

                      borderRadius: '12px', 

                      overflow: 'hidden', 

                      border: '1px solid #ffd6e0',

                      background: product.videoUrl.includes('instagram.com') ? '#fff' : '#000'

                    }}

                  >

                    {product.videoType === 'FILE' ? (

                      <video 

                        src={product.videoUrl} 

                        controls 

                        muted 

                        loop 

                        playsInline 

                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 

                      />

                    ) : getYoutubeId(product.videoUrl) ? (

                      <iframe

                        src={`https://www.youtube.com/embed/${getYoutubeId(product.videoUrl)}`}

                        title={product.name}

                        frameBorder="0"

                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

                        allowFullScreen

                        style={{ width: '100%', height: '100%', border: 'none' }}

                      />

                    ) : product.videoUrl.includes('instagram.com') ? (

                      <iframe

                        src={getInstagramEmbedUrl(product.videoUrl)}

                        title={product.name}

                        frameBorder="0"

                        scrolling="no"

                        allowtransparency="true"

                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"

                        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}

                      />

                    ) : (

                      <a 

                        href={product.videoUrl} 

                        target="_blank" 

                        rel="noopener noreferrer" 

                        style={{ 

                          display: 'flex', 

                          flexDirection: 'column', 

                          alignItems: 'center', 

                          justifyContent: 'center', 

                          height: '100%', 

                          color: '#fff', 

                          textDecoration: 'none',

                          background: 'linear-gradient(135deg, #111 0%, #333 100%)' 

                        }}

                      >

                        <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📺</span>

                        <strong style={{ fontSize: '0.95rem' }}>외부 동영상 링크 보러가기</strong>

                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>{product.videoUrl}</span>

                      </a>

                    )}

                  </div>

                </div>

              )}



              <div className="detail-desc-box" style={{ marginTop: '2.5rem' }}>

                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem', color: '#333', marginBottom: '2.5rem' }}>

                  {product.description}

                </p>

                {product.descriptionImageUrls && product.descriptionImageUrls.length > 0 && (

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginTop: '2rem' }}>

                    {product.descriptionImageUrls.map((url, index) => (

                      <img 

                        key={index}

                        src={url} 

                        alt={`상세 설명 이미지 ${index + 1}`} 

                        style={{ 

                          maxWidth: '100%', 

                          borderRadius: '12px', 

                          border: '1px solid #ffeef2',

                          boxShadow: '0 8px 24px rgba(255, 32, 112, 0.05)'

                        }} 

                      />

                    ))}

                  </div>

                )}

              </div>

            </div>

          )}



          {activeTab === 'review' && (
            <ReviewSection productId={id} reviews={reviews} fetchReviews={fetchReviews} />
          )}

        </div>

      </div>

    </div>

  )

}

