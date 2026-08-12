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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div 
            className="product-shop" 
            onClick={handleShopClick}
            style={{ cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {product.sellerProfileImageUrl ? (
              <img src={product.sellerProfileImageUrl} alt="shop profile" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>🏪</div>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.shopName}</span>
          </div>
          <div style={{ background: '#f5f5f5', color: '#666', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid #eee', flexShrink: 0 }}>
            {{'SLIME':'슬라임','SLANGY':'슬랑이','MALLANGI':'말랑이','SQUISHY':'스퀴시','WAKPPU':'왁뿌','SUPPLIES':'부자재','ETC':'기타'}[product.category] || product.category || '기타'}
          </div>
        </div>
        <h3 className="product-title" style={{ marginTop: 0 }}>{product.name}</h3>
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
