import { Link, useNavigate } from 'react-router-dom';

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
          style={{ cursor: 'pointer', zIndex: 2 }}
        >
          {product.shopName}
        </div>
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price">{product.price.toLocaleString()}원</div>
      </div>
    </Link>
  );
}
