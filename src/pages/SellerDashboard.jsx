import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'
import { productApi } from '../api/products'

export default function SellerDashboard() {
  const { token, role, nickname } = useAuthStore()
  const navigate = useNavigate()
  
  const [myProducts, setMyProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [crawlUrl, setCrawlUrl] = useState('')
  const [isCrawling, setIsCrawling] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    capacity: '',
    texture: '',
    scent: '',
    color: '',
    releaseDate: '',
    description: '',
    imageUrl: '',
    shopName: '',
    purchaseUrl: '',
    tags: ''
  })

  useEffect(() => {
    if (role !== 'SELLER') {
      alert('판매자만 접근 가능합니다.')
      navigate('/')
      return
    }
    fetchMyProducts()
  }, [role])

  const fetchMyProducts = async () => {
    try {
      const data = await productApi.getMyProducts();
      setMyProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCrawl = async () => {
    if (!crawlUrl) {
      alert('상품 URL을 입력해주세요.');
      return;
    }
    try {
      setIsCrawling(true);
      const data = await productApi.crawlProduct(crawlUrl);
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        imageUrl: data.imageUrl || prev.imageUrl,
        description: data.description || prev.description,
        purchaseUrl: crawlUrl
      }));
      alert('상품 정보 자동완성 완료!');
    } catch (err) {
      alert(err.response?.data?.error || '정보를 불러오지 못했습니다. 수동으로 입력해주세요.');
    } finally {
      setIsCrawling(false);
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productApi.createProduct({
        ...formData,
        price: parseInt(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 0,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      });
      alert('상품이 성공적으로 등록되었습니다.');
      setFormData({ name: '', price: '', capacity: '', texture: '', scent: '', color: '', releaseDate: '', description: '', imageUrl: '', shopName: '', purchaseUrl: '', tags: '' });
      setShowForm(false);
      fetchMyProducts();
    } catch (err) {
      alert(err.message || '상품 등록에 실패했습니다.');
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
      await productApi.deleteProduct(id);
      alert('삭제되었습니다.');
      fetchMyProducts();
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  }

  if (role !== 'SELLER') return null

  return (
    <div className="admin-container">
      <h2>판매자 센터 🏢</h2>
      <p style={{marginBottom: '2rem'}}>환영합니다, <strong>{nickname}</strong> 사장님! 여기서 등록하신 슬라임들을 관리하세요.</p>

      <div className="seller-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>내가 등록한 슬라임 관리</h3>
          <button className="nav-btn admin-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '닫기' : '+ 새 상품 등록'}
          </button>
        </div>

        {showForm && (
          <div className="product-add-section" style={{ border: '2px solid var(--primary-color)' }}>
            <h3>새 상품 등록 (SlimeHub 전용)</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#fff0f3', borderRadius: '8px' }}>
              <input 
                type="text" 
                placeholder="카페24, 아임웹 등 상품 URL을 입력하면 자동으로 내용을 채워드려요! ✨" 
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleCrawl}
                disabled={isCrawling}
                style={{ width: '120px', padding: '10px' }}
              >
                {isCrawling ? '불러오는 중...' : '자동 완성'}
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="product-form">
              <input type="text" name="name" placeholder="상품명" required value={formData.name} onChange={handleInputChange} />
              <input type="text" name="shopName" placeholder="스토어명" required value={formData.shopName} onChange={handleInputChange} />
              
              <div style={{display:'flex', gap:'1rem'}}>
                <input type="number" name="price" placeholder="가격 (숫자만)" required value={formData.price} onChange={handleInputChange} />
                <input type="number" name="capacity" placeholder="용량(ml)" value={formData.capacity} onChange={handleInputChange} />
              </div>
              
              <div style={{display:'flex', gap:'1rem'}}>
                <input type="text" name="texture" placeholder="질감 (예: 크런치, 클리어)" value={formData.texture} onChange={handleInputChange} />
                <input type="text" name="scent" placeholder="향 (예: 딸기향)" value={formData.scent} onChange={handleInputChange} />
                <input type="text" name="color" placeholder="색상 (예: 핑크)" value={formData.color} onChange={handleInputChange} />
              </div>

              <input type="date" name="releaseDate" placeholder="출시일" value={formData.releaseDate} onChange={handleInputChange} />
              <input type="text" name="imageUrl" placeholder="대표 이미지 URL" required value={formData.imageUrl} onChange={handleInputChange} />
              <input type="text" name="purchaseUrl" placeholder="공식 스토어 구매 링크 URL" required value={formData.purchaseUrl} onChange={handleInputChange} />
              <input type="text" name="tags" placeholder="태그 (쉼표로 구분. 예: 과일향, 초보자용)" value={formData.tags} onChange={handleInputChange} />
              <textarea name="description" placeholder="상품 상세 설명" required value={formData.description} onChange={handleInputChange} />
              <button type="submit" className="submit-btn">상품 등록하기</button>
            </form>
          </div>
        )}

        {myProducts.length === 0 ? (
          <div className="empty-state">아직 등록한 슬라임이 없어요! 첫 상품을 등록해보세요.</div>
        ) : (
          <div className="admin-table-container" style={{overflowX: 'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>상품 이미지</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>출시일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.imageUrl} alt={p.name} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} /></td>
                    <td><Link to={`/product/${p.id}`} style={{fontWeight:'600'}}>{p.name}</Link></td>
                    <td>{p.price.toLocaleString()}원</td>
                    <td>{p.releaseDate || '-'}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDeleteProduct(p.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
