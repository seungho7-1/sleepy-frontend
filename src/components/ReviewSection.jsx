import { useState } from 'react';
import { ThumbsUp, Flag } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { useAuthStore } from '../store';
import { reviewApi } from '../api/reviews';
import { boardApi } from '../api/board';

export default function ReviewSection({ productId, reviews, fetchReviews }) {
  const { token, role, nickname: currentNickname } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await boardApi.uploadFile(file, 'review-photo');
      setImageUrl(res.url);
      alert('리뷰 사진 업로드 완료!');
    } catch (err) {
      alert('사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const [isLiking, setIsLiking] = useState(false);

  const toggleReviewLike = async (reviewId) => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await boardApi.toggleLike(reviewId, 'REVIEW');
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const reportReview = async (reviewId) => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (window.confirm('이 리뷰를 악성 리뷰로 신고하시겠습니까?')) {
      try {
        await reviewApi.reportReview(reviewId);
        alert('신고가 접수되었습니다.');
        fetchReviews();
      } catch (err) {
        alert(err.response?.data?.message || '신고 처리에 실패했습니다.');
      }
    }
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
    if (isSubmittingReview) return;
    
    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview({ productId: Number(productId), rating, content, imageUrl });
      alert('리뷰가 등록되었습니다.');
      setContent('');
      setImageUrl('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      alert(err.message || '리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
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
        <form className="review-form" onSubmit={handleReviewSubmit} style={{ background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '0px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>만족도를 선택해주세요</div>
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
            style={{ borderRadius: '0px', border: '1px solid #ffd6e0', padding: '12px', width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
          />
          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px', color: '#555' }}>
              리뷰 사진 추가 (최대 1장)
            </label>
            
            {imageUrl ? (
              <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '0px', overflow: 'hidden', border: '1px solid #ffd6e0', marginBottom: '10px' }}>
                <img src={imageUrl} alt="Review Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')} 
                  style={{ 
                    position: 'absolute', 
                    top: '4px', 
                    right: '4px', 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '0px', 
                    background: 'rgba(0,0,0,0.6)', 
                    color: '#fff', 
                    border: 'none', 
                    fontSize: '11px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer' 
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                  id="review-photo-input" 
                />
                <label 
                  htmlFor="review-photo-input" 
                  style={{ 
                    display: 'inline-block',
                    padding: '8px 16px', 
                    background: '#fff', 
                    border: '1.5px dashed var(--primary-color)', 
                    color: 'var(--primary-color)', 
                    borderRadius: '0px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#fff5f7'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#fff'; }}
                >
                  {uploading ? '사진 업로드 중...' : ' 사진 첨부하기'}
                </label>
              </div>
            )}
          </div>
          <button type="submit" className="review-submit-btn" style={{ background: 'var(--primary-color)', color: 'white', borderRadius: '0px', padding: '10px 24px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>리뷰 등록</button>
          <div style={{ clear: 'both' }}></div>
        </form>
      ) : (
        <div className="empty-state" style={{ padding: '2.5rem', background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '0px', marginBottom: '2.5rem', fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '600' }}>
          리뷰를 작성하려면 로그인이 필요합니다.
        </div>
      )}
      
      <div className="review-list">
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem 0', background: '#fffbfd', border: '1px solid #ffd6e0', borderRadius: '0px', color: '#888' }}>아직 등록된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</div>
        ) : (
          reviews.map(review => (
            <div id={`review-${review.id}`} key={review.id} className="review-item" style={{ borderBottom: '1px solid #ffeef2', padding: '1.5rem 0' }}>
              <div className="review-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="review-author" style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111' }}>{review.nickname || review.authorNickname || '익명'}</span>
                  <span className="review-stars" style={{ color: '#ffb400', fontSize: '1.05rem', margin: 0 }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="review-date" style={{ color: '#999', fontSize: '0.85rem' }}>{formatDate(review.createdAt)}</span>
                  {!review.isHidden && review.nickname !== currentNickname && role !== 'ADMIN' && (
                    <button 
                      onClick={() => reportReview(review.id)}
                      style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Flag size={13} color="var(--primary-color)" />
                      <span>신고</span>
                    </button>
                  )}
                </div>
              </div>
              
              {review.isHidden ? (
                <div style={{ padding: '1.5rem', background: '#f5f5f5', borderRadius: '0px', color: '#888', textAlign: 'center', margin: '1rem 0' }}>
                  신고 누적으로 인해 블라인드 처리된 리뷰입니다.
                </div>
              ) : (
                <>
                  <div className="review-content" style={{ marginTop: '0.5rem', color: '#333', fontSize: '0.95rem', lineHeight: '1.6' }}>{review.content}</div>
                  {review.imageUrl && (
                    <div style={{ marginTop: '1rem' }}>
                      <img src={review.imageUrl} alt="review" style={{ maxWidth: '240px', maxHeight: '240px', objectFit: 'contain', borderRadius: '0px', border: '1px solid #eee' }} />
                    </div>
                  )}
                  <div style={{ marginTop: '1.2rem' }}>
                    <button 
                      onClick={() => toggleReviewLike(review.id)}
                      disabled={isLiking}
                      style={{ background: '#fff', border: '1px solid #ffd6e0', borderRadius: '0px', padding: '6px 14px', cursor: isLiking ? 'default' : 'pointer', fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', fontWeight: 'bold', opacity: isLiking ? 0.7 : 1 }}
                      onMouseEnter={(e) => {
                        if (isLiking) return;
                        e.target.style.background = '#fff5f7';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                      }}
                    >
                      👍 도움이 됐어요 {review.likeCount || 0}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
