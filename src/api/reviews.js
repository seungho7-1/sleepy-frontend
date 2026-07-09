import api from './index';

export const reviewApi = {
  // 특정 상품의 리뷰 조회
  getProductReviews: (productId) => 
    api.get(`/reviews/product/${productId}`),

  // 리뷰 작성
  createReview: (data) => 
    api.post(`/reviews`, data),

  // 리뷰 삭제
  deleteReview: (reviewId) => 
    api.delete(`/reviews/${reviewId}`),
};
