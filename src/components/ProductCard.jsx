import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleShopClick = (e) => {
    e.preventDefault(); // 상품 상세 페이지 이동 방지
    navigate(`/?search=${encodeURIComponent(product.shopName)}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <div 
          className="product-shop" 
          onClick={handleShopClick}
          style={{ cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {product.sellerProfileImageUrl ? (
            <img src={product.sellerProfileImageUrl} alt="shop profile" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🏪</div>
          )}
          {product.shopName}
        </div>
        <h3 className="product-title">{product.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
          <div className="product-price">{product.price.toLocaleString()}원</div>
          <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
            <Star size={14} fill={product.reviewCount > 0 ? "#ffb400" : "#ddd"} color={product.reviewCount > 0 ? "#ffb400" : "#ddd"} />
            <span>{product.avgRating ? product.avgRating.toFixed(1) : '0.0'} ({product.reviewCount || 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
