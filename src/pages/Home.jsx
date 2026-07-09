import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'

const CATEGORIES = ['전체', '크런키', '클리어', '샤베트', '버터']
const FEED_MAX = 10 // 자랑피드 최대 표시 개수

export default function Home() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [latestPosts, setLatestPosts] = useState([])
  const feedScrollRef = useRef(null)
  
  // Paging state
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts(0, true)
    // eslint-disable-next-line
  }, [searchQuery])

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  const fetchLatestPosts = async () => {
    try {
      const data = await boardApi.getPosts('MEDIA', 0, FEED_MAX)
      setLatestPosts((data.content || []).slice(0, FEED_MAX))
    } catch (error) {
      console.error('Failed to fetch latest posts:', error)
    }
  }

  const fetchProducts = async (pageNumber = 0, reset = false) => {
    try {
      if (reset) setLoading(true)
      const keyword = searchQuery === '전체' ? '' : searchQuery;
      const data = await productApi.getProducts(keyword, pageNumber, 8);
      
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

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts(0, true)
  }

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat)
    if (cat === '전체') {
      setSearchQuery('')
    } else {
      setSearchQuery(cat)
    }
  }

  const loadMore = () => {
    if (page + 1 < totalPages) {
      fetchProducts(page + 1, false)
    }
  }

  // 피드 좌우 스크롤 핸들러
  const scrollFeed = (direction) => {
    const el = feedScrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.8
    el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' })
  }

  return (
    <>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            className="search-input" 
            placeholder="상품명 또는 스토어명 검색" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>
      </div>

      {/* 실시간 슬라임 자랑 피드 📷 — 2행 그리드, 좌우 스와이프 */}
      <div className="latest-posts-section" style={{ padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            실시간 슬라임 자랑 피드 📷
          </h3>
          <Link 
            to="/community?tab=MEDIA" 
            style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}
          >
            더보기 &gt;
          </Link>
        </div>

        {latestPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-sub)' }}>
            아직 등록된 자랑 영상/사진이 없습니다.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* 좌측 스크롤 화살표 (데스크톱) */}
            <button
              onClick={() => scrollFeed('left')}
              aria-label="이전"
              style={{
                position: 'absolute', top: '50%', left: '-12px', transform: 'translateY(-50%)',
                zIndex: 10, width: '32px', height: '32px', borderRadius: '50%',
                background: 'white', border: '1px solid #eee',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: '#555'
              }}
            >‹</button>

            {/* 2행 가로 스크롤 그리드 */}
            <div
              ref={feedScrollRef}
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(2, 1fr)',
                gridAutoFlow: 'column',
                gridAutoColumns: '140px',
                gap: '10px',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '4px',
              }}
            >
              {latestPosts.map(post => (
                <Link
                  to={`/community/${post.id}`}
                  key={post.id}
                  style={{
                    scrollSnapAlign: 'start',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '140px',
                    height: '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #ffeef2',
                    backgroundColor: '#fafafa',
                  }}>
                    {post.imageUrl ? (
                      post.imageUrl.match(/\.(mp4|webm)$/i) ? (
                        <video src={post.imageUrl} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ffe5ee, #ffccd9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>🫧</span>
                      </div>
                    )}
                    {/* 하단 그라데이션 오버레이 */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                      padding: '0.6rem 0.5rem 0.4rem',
                      color: 'white',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>@{post.nickname}</span>
                        <span>♥ {post.likeCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 우측 스크롤 화살표 (데스크톱) */}
            <button
              onClick={() => scrollFeed('right')}
              aria-label="다음"
              style={{
                position: 'absolute', top: '50%', right: '-12px', transform: 'translateY(-50%)',
                zIndex: 10, width: '32px', height: '32px', borderRadius: '50%',
                background: 'white', border: '1px solid #eee',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: '#555'
              }}
            >›</button>
          </div>
        )}
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main>
        {loading ? (
          <div className="empty-state">불러오는 중...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">검색된 상품이 없습니다.</div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {page + 1 < totalPages && (
              <div className="load-more-container">
                <button onClick={loadMore} className="load-more-btn">더보기</button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
