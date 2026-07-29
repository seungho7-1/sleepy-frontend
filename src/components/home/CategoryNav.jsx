import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function CategoryNav({ categories, activeCategory, onCategoryClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('search')) {
      setSearchQuery(params.get('search'));
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <div style={{ borderBottom: '1px solid #e9ecef', marginBottom: '2rem', background: '#fff' }}>
      <div className="shop-nav-container" style={{ padding: '0' }}>
        
        {/* 카테고리 탭 영역 */}
        <div className="shop-categories">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => onCategoryClick(cat)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                fontSize: '1rem',
                fontWeight: activeCategory === cat ? 'bold' : '500',
                color: activeCategory === cat ? 'var(--primary-color)' : '#555',
                borderBottom: activeCategory === cat ? '3px solid var(--primary-color)' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 검색창 영역 */}
        <div className="shop-nav-filters">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '24px', padding: '6px 14px', background: '#f5f5f5', flex: 1, minWidth: '140px', maxWidth: '300px', transition: 'all 0.2s' }}>
            <Search size={16} color="#888" style={{ marginRight: '6px', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="상품명 또는 스토어명 검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%', color: '#111' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { 
                  setSearchQuery(''); 
                  const params = new URLSearchParams(location.search);
                  params.delete('search');
                  navigate(`/?${params.toString()}`);
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
  );
}
