import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import './AdminDashboard.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err) {
      alert('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id, isHidden) => {
    if (!window.confirm(isHidden ? '상품 숨김을 해제하시겠습니까?' : '상품을 강제로 숨기겠습니까?')) return;
    try {
      if (isHidden) {
        await adminApi.unhideProduct(id);
      } else {
        await adminApi.hideProduct(id);
      }
      fetchProducts();
    } catch (err) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-title">상품 관리</h2>
        <p className="admin-subtitle">마켓에 등록된 전체 상품을 모니터링하고 관리합니다.</p>
      </div>
      
      <div className="admin-table-wrapper">
        <table className="admin-table-clean">
          <thead>
            <tr>
              <th>ID</th>
              <th>이미지</th>
              <th>상품명</th>
              <th>상점</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ opacity: p.isHidden ? 0.6 : 1 }}>
                <td className="text-muted">{p.id}</td>
                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl.split(',')[0]} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f3f5', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#adb5bd', fontSize: '0.75rem' }}>No Img</div>
                  )}
                </td>
                <td className="font-semibold">{p.name}</td>
                <td>{p.shopName}</td>
                <td>
                  <span className={`font-semibold ${p.isHidden ? 'text-danger' : 'text-success'}`}>
                    {p.isHidden ? '숨김 처리됨' : '정상 노출'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleHide(p.id, p.isHidden)}
                    className={`admin-btn-action ${p.isHidden ? 'admin-btn-success' : 'admin-btn-warning'}`}
                  >
                    {p.isHidden ? '숨김 해제' : '강제 숨김'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
