import React from 'react';
import ProductCard from '../ProductCard';

export default function ProductGrid({ loading, products, page, totalPages, loadMore }) {
  if (loading) return <div className="empty-state">불러오는 중...</div>;
  if (products.length === 0) return <div className="empty-state">검색된 상품이 없습니다.</div>;

  return (
    <>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {page + 1 < totalPages && (
        <div className="load-more-container">
          <button onClick={loadMore} className="load-more-btn">더보기</button>
        </div>
      )}
    </>
  );
}
