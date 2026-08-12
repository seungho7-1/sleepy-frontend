import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'
import HeroCarousel from '../components/home/HeroCarousel';
import { Search } from 'lucide-react';
import CategoryNav from '../components/home/CategoryNav';
import ProductGrid from '../components/home/ProductGrid';

import { CATEGORIES, getCategoryApiValue } from '../utils/categoryUtils'
const FEED_MAX = 10 

export default function Home() {
  const [latestPosts, setLatestPosts] = useState([])
  const [popularProducts, setPopularProducts] = useState([]) 

  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('createdAt,desc')
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Sync state with URL category and search parameters
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    
    if (cat && CATEGORIES.includes(cat)) {
      setActiveCategory(cat)
    } else {
      setActiveCategory('전체')
    }

    if (search) {
      setSearchQuery(search)
    } else {
      setSearchQuery('')
    }
  }, [searchParams])

  useEffect(() => {
    fetchLatestPosts()
    fetchPopularProducts()
  }, [])

  useEffect(() => {
    fetchProducts(0, true)
    // eslint-disable-next-line
  }, [searchQuery, activeCategory, sortOption])

  const fetchLatestPosts = async () => {
    try {
      const data = await boardApi.getPosts('MEDIA', '', 0, FEED_MAX)
      setLatestPosts((data.content || []).slice(0, FEED_MAX))
    } catch (error) {
      console.error('Failed to fetch latest posts:', error)
    }
  }

  // 인기 상품은 카테고리와 무관하게 전체 기준 상위 10개
  const fetchPopularProducts = async () => {
    try {
      const data = await productApi.getProducts('', '', '', 0, 50, 'reviewCount,desc')
      const all = data?.content || []
      const scored = all
        .map(p => ({ ...p, _score: (p.reviewCount || 0) * 3 + (p.avgRating || 0) * 2 }))
        .filter(p => p._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, 10) 
      setPopularProducts(scored)
    } catch (err) {
      console.error('Failed to fetch popular products:', err)
    }
  }

  // 전체 상품 목록 (카테고리 및 검색어, 정렬 필터 적용)
  const fetchProducts = async (pageNumber = 0, reset = false) => {
    try {
      if (reset) setLoading(true)
      
      let categoryApiValue = getCategoryApiValue(activeCategory);

      const data = await productApi.getProducts(categoryApiValue, searchQuery, '', pageNumber, 20, sortOption);
      
      if (data && data.content) {
        setProducts(prev => reset ? data.content : [...prev, ...data.content])
        setTotalPages(data.totalPages)
        setPage(pageNumber)
      } else {
        setProducts(reset ? [] : products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      if (reset) setLoading(false)
    }
  }

  const loadMore = () => {
    if (page + 1 < totalPages) {
      fetchProducts(page + 1, false)
    }
  }

  const renderProductScroller = (title, subtitle, scrollerProducts, scrollId) => {
    if (!scrollerProducts || scrollerProducts.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111' }}>
            {title}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{subtitle}</span>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              const el = document.getElementById(scrollId);
              if (el) el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
            }}
            aria-label="이전"
            style={{
              position: 'absolute', top: '50%', left: '-16px', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: 'white', border: '1px solid #ffeef2',
               cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >‹</button>

          <div id={scrollId} style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {scrollerProducts.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => window.location.href = `/product/${product.id}`}
                style={{
                  flexShrink: 0, width: '160px',
                  borderRadius: '0px', background: 'white',
                  border: '1px solid #ffeef2',
                  cursor: 'pointer', overflow: 'hidden',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  scrollSnapAlign: 'start'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff2070 0%, #ff5c97 100%)',
                  color: 'white', fontSize: '0.75rem', fontWeight: '900',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{idx + 1}</div>
                
                <img
                  src={product.imageUrl || (product.imageUrls?.[0]) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300'}
                  alt={product.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                    <div style={{color: '#666', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {{'SLIME':'슬라임','SLANGY':'슬랑이','MALLANGI':'말랑이','SQUISHY':'스퀴시','WAKPPU':'왁뿌','SUPPLIES':'부자재','ETC':'기타'}[product.category] || product.category || '기타'}
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontWeight: 'bold', color: '#111' }}>{product.price ? `${product.price.toLocaleString()}원` : '가격 미정'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                      <span style={{ color: product.reviewCount > 0 ? '#ffb400' : '#ddd', fontSize: '1rem' }}>★</span>
                      <span>{product.avgRating ? product.avgRating.toFixed(1) : '0.0'} ({product.reviewCount || 0})</span>
</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const el = document.getElementById(scrollId);
              if (el) el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
            }}
            aria-label="다음"
            style={{
              position: 'absolute', top: '50%', right: '-16px', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: 'white', border: '1px solid #ffeef2',
               cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >›</button>
        </div>
      </div>
    );
  };

  const handleCategoryClick = (cat) => {
    setSearchParams({ category: cat })
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
      {!searchQuery && <HeroCarousel latestPosts={latestPosts} />}

      {/* 🔥 인기 상품 섹션 */}
      {!searchQuery && renderProductScroller('🔥 인기 슬라임 종합 랭킹', '리뷰·별점 기준', popularProducts, 'rank-scroll')}

      {/* 카테고리 네비게이션 및 정렬 */}
      <CategoryNav 
        categories={CATEGORIES} 
        activeCategory={activeCategory} 
        onCategoryClick={handleCategoryClick} 
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <main style={{ padding: 0 }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111', margin: 0 }}>
            {searchQuery ? `"${searchQuery}" 검색 결과` : `${activeCategory === '전체' ? '전체' : activeCategory} 상품 목록`}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
            다양한 슬라임들을 탐색해보세요!
          </p>
        </div>
        <ProductGrid 
          loading={loading}
          products={products}
          page={page}
          totalPages={totalPages}
          loadMore={loadMore}
        />
      </main>
    </div>
  )
}
