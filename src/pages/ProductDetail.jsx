import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { productApi } from '../api/products'
import { reviewApi } from '../api/reviews'
import { boardApi } from '../api/board'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detail')
  
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [isWished, setIsWished] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    if (token) checkWishStatus()
  }, [id, token])

  const fetchProduct = async () => {
    try {
      const data = await productApi.getProductDetail(id);
      setProduct(data);
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
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    try {
      const data = await productApi.toggleWishlist(id);
      setIsWished(data.wished);
    } catch (err) {
      console.error(err);
    }
  }

  const toggleReviewLike = async (reviewId) => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    try {
      await boardApi.toggleLike(reviewId, 'REVIEW');
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    try {
      await reviewApi.createReview({ productId: id, rating, content, imageUrl });
      alert('리뷰가 등록되었습니다.');
      setContent('');
      setImageUrl('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      alert(err.message || '리뷰 등록에 실패했습니다.');
    }
  }

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
        {/* 왼쪽: 1:1 비율 정사각형 대표 이미지 & 슬라임 감성 테두리 */}
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
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
          {/* 러블리 버블 데코레이션 */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.85)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)', backdropFilter: 'blur(4px)', border: '1.5px solid #ffd6e0' }}>
            🫧 SLIME
          </div>
        </div>
        
        {/* 오른쪽: 상품 정보 & 구매 액션 */}
        <div className="detail-summary-content" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* 스토어 정보 (슬라임 핑크 스타일) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {product.shopName || '일반스토어'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>&gt;</span>
          </div>

          {/* 상품 타이틀 */}
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#111', margin: 0, lineHeight: '1.35', letterSpacing: '-0.5px' }}>
            {product.name}
          </h1>

          {/* 리뷰 요약 별점 */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#333' }}>
              <span style={{ color: '#ffb400', fontSize: '1.1rem' }}>★</span>
              <strong style={{ fontWeight: '700' }}>{avgRating}</strong>
              <span style={{ color: '#888' }}>({reviews.length}개 리뷰)</span>
            </div>
          )}
          
          {/* 가격 표시 */}
          <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #ffeef2', paddingBottom: '1.5rem', margin: '0.5rem 0 0.5rem 0' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: '900', color: '#000', letterSpacing: '-1px' }}>
              {product.price.toLocaleString()}
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#000', marginLeft: '2px' }}>원</span>
          </div>

          {/* 태그 목록 */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {product.tags.map((tag, idx) => (
                <span key={idx} style={{ background: '#fff0f3', color: 'var(--primary-color)', padding: '0.35rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', border: '1px solid #ffe1e7' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 구매 / 찜하기 버튼 그룹 */}
          <div className="bottom-bar" style={{ display: 'flex', gap: '12px', marginTop: 'auto', width: '100%', position: 'relative', background: 'none', padding: 0, boxShadow: 'none' }}>
            {/* 찜하기 토글 버튼 (슬라임 테마 핑크 보더) */}
            <button 
              className={`wish-btn ${isWished ? 'active' : ''}`} 
              onClick={toggleWish}
              style={{
                width: '56px',
                height: '56px',
                border: isWished ? '1.5px solid var(--primary-color)' : '1px solid #e5e5e5',
                borderRadius: '12px',
                background: isWished ? '#fff5f7' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.6rem',
                color: isWished ? 'var(--primary-color)' : '#888',
                boxShadow: isWished ? '0 4px 10px rgba(255, 32, 112, 0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isWished ? '♥' : '♡'}
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
              {/* 안전 거래 경고창 */}
              <div className="warning-box">
                <span className="warning-icon">!</span>
                <span>판매자가 외부 메신저 유도 또는 개인 계좌로 직거래 입금을 권유하는 경우 <strong>결제하지 마시고</strong> 고객센터로 신고해주세요.</span>
              </div>

              {/* 상품정보 표 */}
              <div className="product-info-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111' }}>상품 주요 스펙 🫧</h3>
                  <button style={{ border: '1px solid #ffd6e0', background: '#fff5f7', padding: '5px 12px', fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer', borderRadius: '20px', fontWeight: 'bold' }}>신고하기</button>
                </div>
                
                <table className="info-table">
                  <tbody>
                    <tr>
                      <th>🆔 상품번호</th>
                      <td>
                        {product.id} 
                        <button className="copy-btn" onClick={handleCopyId}>복사</button>
                      </td>
                    </tr>
                    <tr>
                      <th>🏪 제조사/브랜드</th>
                      <td>{product.shopName || '일반스토어'}</td>
                    </tr>
                    <tr>
                      <th>💧 용량</th>
                      <td>{product.capacity ? `${product.capacity}ml` : '-'}</td>
                    </tr>
                    <tr>
                      <th>🧱 질감/향</th>
                      <td>{product.texture || '-'} / {product.scent || '-'}</td>
                    </tr>
                    <tr>
                      <th>🎨 색상</th>
                      <td>{product.color || '-'}</td>
                    </tr>
                    <tr>
                      <th>📅 출시일</th>
                      <td>{product.releaseDate || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="detail-desc-box" style={{ marginTop: '2.5rem' }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem', color: '#333', marginBottom: '2.5rem' }}>
                  {product.description}
                </p>
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <img 
                    src={product.imageUrl} 
                    alt="상세 설명 이미지" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: '12px', 
                      border: '1px solid #ffeef2',
                      boxShadow: '0 8px 24px rgba(255, 32, 112, 0.05)'
                    }} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="review-section fade-in" style={{ border: 'none', padding: 0, marginTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.8rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111' }}>상품 리뷰 ({reviews.length})</h3>
                {reviews.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ffb400', fontSize: '1.2rem' }}>★</span>
                    <strong style={{ fontSize: '1.1rem' }}>{avgRating}</strong>
                  </div>
                )}
              </div>
              
              {token ? (
                <form className="review-form" onSubmit={handleReviewSubmit} style={{ background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>만족도를 선택해주세요 🫧</div>
                  <div className="review-rating-input" style={{ marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button"
                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                        style={{ 
                          fontSize: '1.8rem', 
                          padding: '0 4px', 
                          cursor: 'pointer',
                          color: star <= rating ? 'var(--primary-color)' : '#ddd'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="review-textarea" 
                    placeholder="이 슬라임 어떠셨나요? 플레이 느낌이나 질감 후기를 들려주세요! 후기는 다른 구매자들에게 큰 도움이 됩니다."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #ffd6e0', padding: '12px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="리뷰 사진 URL (선택사항)" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    style={{ width: '100%', marginBottom: '15px', padding: '12px', border: '1px solid #ffd6e0', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="review-submit-btn" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #ff5b94 100%)', borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 10px rgba(255, 32, 112, 0.15)' }}>리뷰 등록</button>
                  <div style={{ clear: 'both' }}></div>
                </form>
              ) : (
                <div className="empty-state" style={{ padding: '2.5rem', background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '12px', marginBottom: '2.5rem', fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                  리뷰를 작성하려면 로그인이 필요합니다.
                </div>
              )}
              
              <div className="review-list">
                {reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '4rem 0', background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '12px', color: '#888' }}>아직 등록된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-item" style={{ borderBottom: '1px solid #ffeef2', padding: '1.5rem 0' }}>
                      <div className="review-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="review-author" style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111' }}>{review.authorNickname || '익명'}</span>
                          <span className="review-stars" style={{ color: '#ffb400', fontSize: '1.05rem', margin: 0 }}>
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        <span className="review-date" style={{ color: '#999', fontSize: '0.85rem' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="review-content" style={{ marginTop: '0.5rem', color: '#333', fontSize: '0.95rem', lineHeight: '1.6' }}>{review.content}</div>
                      {review.imageUrl && (
                        <div style={{ marginTop: '1rem' }}>
                          <img src={review.imageUrl} alt="review" style={{ maxWidth: '240px', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                        </div>
                      )}
                      <div style={{ marginTop: '1.2rem' }}>
                        <button 
                          onClick={() => toggleReviewLike(review.id)}
                          style={{ background: '#fff', border: '1px solid #ffd6e0', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', fontWeight: 'bold' }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#fff5f7';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#fff';
                          }}
                        >
                          👍 도움이 됐어요 {review.likeCount || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
