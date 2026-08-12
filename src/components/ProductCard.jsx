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
      <div className="product-image-wrapper" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: '0px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 2 }}>
          {{'SLIME':'슬라임','SLANGY':'슬랑이','MALLANGI':'말랑이','SQUISHY':'스퀴시','WAKPPU':'왁뿌','SUPPLIES':'부자재','ETC':'기타'}[product.category] || product.category || '기타'}
        </div>
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
            <span style={{ color: product.reviewCount > 0 ? '#ffb400' : '#ddd', fontSize: '1rem' }}>★</span>
            <span>{product.avgRating ? product.avgRating.toFixed(1) : '0.0'} ({product.reviewCount || 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
