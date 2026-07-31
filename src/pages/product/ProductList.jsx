import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/products';
import ProductGrid from '../../components/home/ProductGrid';
import { Search } from 'lucide-react';

const CATEGORIES = ['전체', '슬라임', '슬랑이', '말랑이', '스퀴시'];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get('category') || '전체';
  const searchQuery = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSearchInput(searchQuery);
    fetchProducts(0, true);
    // eslint-disable-next-line
  }, [searchQuery, activeCategory]);

  const fetchProducts = async (pageNumber = 0, reset = false) => {
    try {
      if (reset) setLoading(true);
      
      let categoryApiValue = '';
      if (activeCategory === '슬라임') categoryApiValue = 'SLIME';
      else if (activeCategory === '슬랑이') categoryApiValue = 'SLANGY';
      else if (activeCategory === '말랑이') categoryApiValue = 'MALLANGI';
      else if (activeCategory === '스퀴시') categoryApiValue = 'SQUISHY';

      const data = await productApi.getProducts(categoryApiValue, searchQuery, '', pageNumber, 20);
      
      if (data && data.content) {
        setProducts(prev => reset ? data.content : [...prev, ...data.content]);
        setTotalPages(data.totalPages);
        setPage(pageNumber);
      } else {
        setProducts(reset ? [] : products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      if (reset) setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === '전체') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  const loadMore = () => {
    if (page + 1 < totalPages) {
      fetchProducts(page + 1, false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
      
      {/* Header section with categories and search */}
      <div style={{ borderBottom: '1px solid var(--border-color)', background: '#fff', marginBottom: '1rem' }}>
        <div className="shop-nav-container" style={{ padding: '0' }}>
          
          <div className="shop-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  fontSize: '1rem',
                  fontWeight: activeCategory === cat ? 'bold' : '500',
                  color: activeCategory === cat ? 'var(--primary-color)' : '#555',
                  borderBottom: activeCategory === cat ? '3px solid var(--primary-color)' : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="shop-nav-filters">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '24px', padding: '6px 14px', background: '#f5f5f5', flex: 1, minWidth: '140px', maxWidth: '200px', transition: 'all 0.2s' }}>
              <Search size={16} color="#888" style={{ marginRight: '6px', flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="상품명 또는 스토어명 검색" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%' }}
              />
              {searchInput && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setSearchInput('');
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    setSearchParams(params);
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', marginLeft: '6px'
                  }}
                >
                  ✖
                </button>
              )}
            </form>
          </div>

        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111', margin: 0 }}>
          {searchQuery ? `"${searchQuery}" 검색 결과` : `${activeCategory} 전체 상품 목록`}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>
          매일 새롭게 업데이트되는 슬라임들을 만나보세요!
        </p>
      </div>

      <main style={{ padding: '0' }}>
        <ProductGrid 
          loading={loading}
          products={products}
          page={page}
          totalPages={totalPages}
          loadMore={loadMore}
        />
      </main>
    </div>
  );
}
