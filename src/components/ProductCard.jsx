import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <div className="product-shop">{product.shopName}</div>
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price">{product.price.toLocaleString()}원</div>
      </div>
    </Link>
  );
}
