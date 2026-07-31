import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'
import HeroCarousel from '../components/home/HeroCarousel';
import { Search } from 'lucide-react';
import CategoryNav from '../components/home/CategoryNav';
import ProductGrid from '../components/home/ProductGrid';

const CATEGORIES = ['전체', '슬라임', '슬랑이', '말랑이', '스퀴시']
const FEED_MAX = 10 // 자랑피드 최대 표시 개수

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([]) // 🔥 인기 상품
  const [activeCategory, setActiveCategory] = useState('전체')
  const [latestPosts, setLatestPosts] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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
    fetchProducts(0, true)
    // eslint-disable-next-line
  }, [searchQuery, activeCategory])

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  useEffect(() => {
    fetchPopularProducts(activeCategory)
  }, [activeCategory])

  // 🔥 인기 상품 - reviewCount*3 + avgRating*2 기반 상위 12개
  const fetchPopularProducts = async (catName) => {
    try {
      let categoryApiValue = '';
      if (catName === '슬라임') categoryApiValue = 'SLIME';
      else if (catName === '슬랑이') categoryApiValue = 'SLANGY';
      else if (catName === '말랑이') categoryApiValue = 'MALLANGI';
      else if (catName === '스퀴시') categoryApiValue = 'SQUISHY';

      const data = await productApi.getProducts(categoryApiValue, '', '', 0, 50, 'reviewCount,desc')
      const all = data?.content || []
      const scored = all
        .map(p => ({ ...p, _score: (p.reviewCount || 0) * 3 + (p.avgRating || 0) * 2 }))
        .filter(p => p._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, 12) // 최대 12개 표시
      setPopularProducts(scored)
    } catch (err) {
      console.error('Failed to fetch popular products:', err)
    }
  }

  const fetchLatestPosts = async () => {
    try {
      const data = await boardApi.getPosts('MEDIA', '', 0, FEED_MAX)
      setLatestPosts((data.content || []).slice(0, FEED_MAX))
    } catch (error) {
      console.error('Failed to fetch latest posts:', error)
    }
  }

  const fetchProducts = async (pageNumber = 0, reset = false) => {
    try {
      if (reset) setLoading(true)
      
      let categoryApiValue = '';
      if (activeCategory === '슬라임') categoryApiValue = 'SLIME';
      else if (activeCategory === '슬랑이') categoryApiValue = 'SLANGY';
      else if (activeCategory === '말랑이') categoryApiValue = 'MALLANGI';
      else if (activeCategory === '스퀴시') categoryApiValue = 'SQUISHY';

      const keyword = searchQuery;
      const data = await productApi.getProducts(categoryApiValue, keyword, '', pageNumber, 20);
      
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

  const handleCategoryClick = (cat) => {
    setSearchParams({ category: cat })
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
      <HeroCarousel latestPosts={latestPosts} />
      <CategoryNav 
        categories={CATEGORIES} 
        activeCategory={activeCategory} 
        onCategoryClick={handleCategoryClick} 
      />

      {/* 🔥 인기 상품 섹션 */}
      {popularProducts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111' }}>
              🔥 {activeCategory === '전체' ? '인기 슬라임 종합 랭킹' : `인기 ${activeCategory} 랭킹`}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>리뷰·별점 기준</span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
            {popularProducts.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => window.location.href = `/product/${product.id}`}
                style={{
                  flexShrink: 0, width: '160px',
                  borderRadius: '12px', background: 'white',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  cursor: 'pointer', overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)' }}
              >
                {/* 순위 배지 */}
                <div style={{
                  position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: idx === 0 ? '#ff2070' : idx === 1 ? '#ff7043' : idx === 2 ? '#ffa000' : 'rgba(0,0,0,0.4)',
                  color: 'white', fontSize: '0.75rem', fontWeight: '900',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{idx + 1}</div>
                <img
                  src={product.imageUrl || (product.imageUrls?.[0]) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300'}
                  alt={product.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>{product.shopName}</div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', color: '#aaa' }}>
                    <span>⭐ {product.avgRating?.toFixed(1) || '0.0'}</span>
                    <span>리뷰 {product.reviewCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <Link 
              to={activeCategory === '전체' ? '/products' : `/products?category=${activeCategory}`}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.8rem 2.5rem', borderRadius: '30px',
                background: 'linear-gradient(135deg, #ff2070 0%, #ff5c97 100%)',
                color: 'white', fontSize: '1rem', fontWeight: '700',
                textDecoration: 'none', boxShadow: '0 4px 12px rgba(255, 32, 112, 0.25)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {activeCategory === '전체' ? '전체 상품 보러가기' : `${activeCategory} 전체 보기`}
            </Link>
          </div>
        </div>
      ) : null}

      <main style={{ padding: 0 }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111', margin: 0 }}>
            {searchQuery ? `"${searchQuery}" 검색 결과` : `${activeCategory === '전체' ? '전체' : activeCategory} 상품 목록`}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
            새롭게 업데이트되는 슬라임들을 만나보세요!
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
