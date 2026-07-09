import api from './index';

export const productApi = {
  // 전체 목록 및 검색
  getProducts: (keyword = '', page = 0, size = 8) => 
    api.get(`/products/list`, { params: { keyword, page, size } }),

  // 상품 상세
  getProductDetail: (id) => 
    api.get(`/products/detail/${id}`),

  // 판매자: 본인 상품 목록
  getMyProducts: () => 
    api.get(`/auth/my-products`),

  // 상품 등록 (판매자)
  createProduct: (data) => 
    api.post(`/products/create`, data),

  // 상품 삭제 (판매자)
  deleteProduct: (id) => 
    api.post(`/products/delete/${id}`),

  // URL 크롤링 자동완성
  crawlProduct: (url) => 
    api.get(`/products/crawl`, { params: { url } }),

  // 내 위시리스트
  getWishlist: () => 
    api.get(`/products/wishlist`),

  // 위시리스트 토글
  toggleWishlist: (productId) => 
    api.post(`/products/wish/${productId}`)
};
