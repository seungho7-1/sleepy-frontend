import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../api/products'
import { boardApi } from '../api/board'
import { isVideo } from '../utils/media'
import Avatar from '../components/Avatar'
import HoverVideo from '../components/HoverVideo'

const CATEGORIES = ['전체', '슬라임', '슬랑이', '말랑이', '스퀴시']
const FEED_MAX = 10 // 자랑피드 최대 표시 개수

export default function Home() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [latestPosts, setLatestPosts] = useState([])
  const feedScrollRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Paging state
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
      const data = await productApi.getProducts(categoryApiValue, keyword, pageNumber, 20);
      
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
    setSearchParams(searchQuery ? { search: searchQuery } : {})
    fetchProducts(0, true)
  }

  const handleCategoryClick = (cat) => {
    setSearchParams({ category: cat })
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
            style={{ paddingRight: searchQuery ? '4.5rem' : '3rem' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); fetchProducts(0, true); }}
              style={{
                position: 'absolute',
                right: '3rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="검색어 지우기"
            >
              ✖
            </button>
          )}
          <button type="submit" className="search-btn">🔍</button>
        </form>
      </div>

      {/* 실시간 슬라임 자랑 피드 📷 — Ohouse 스타일 캐러셀 */}
      <div className="latest-posts-section" style={{ padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111', margin: 0 }}>
              실시간 슬라임 자랑 피드 📷
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
              유저들이 올린 매력 만점 슬라임 플레이 피드
            </p>
          </div>
          <Link 
            to="/gallery" 
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
            {/* 좌측 스크롤 화살표 (데스크톱 전용) */}
            <button
              onClick={() => scrollFeed('left')}
              aria-label="이전"
              style={{
                position: 'absolute', top: '50%', left: '-16px', transform: 'translateY(-50%)',
                zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
                background: 'white', border: '1px solid #ffeef2',
                boxShadow: '0 4px 10px rgba(255, 32, 112, 0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >‹</button>

            {/* 단일행 가로 스크롤 캐러셀 */}
            <div
              ref={feedScrollRef}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '4px 0',
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
                    flex: '0 0 135px',
                    display: 'block',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '135px',
                    aspectRatio: '3 / 4',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #ffeef2',
                    backgroundColor: '#fafafa',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    {post.imageUrl ? (
                      post.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                        <HoverVideo src={post.imageUrl} />
                      ) : (
                        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ffe5ee, #ffccd9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>🫧</span>
                      </div>
                    )}

                    {/* 이미지 내 하단 오버레이 (아바타, 닉네임, 좋아요 표시) */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                      padding: '12px 10px 8px 10px',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Avatar name={post.nickname} size={18} style={{ border: '1px solid #ffd6e0' }} />
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: '600', 
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)', 
                          maxWidth: '65px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {post.nickname}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <div style={{ color: '#ff5b94', textShadow: '0 1px 2px rgba(0,0,0,0.4)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>♥</span>
                          <span style={{ fontSize: '0.7rem', color: 'white' }}>{post.likeCount}</span>
                        </div>
                        <div style={{ color: '#eaeaea', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '0.7rem' }}>👁</span>
                          <span style={{ fontSize: '0.65rem', color: 'white' }}>{post.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 우측 스크롤 화살표 (데스크톱 전용) */}
            <button
              onClick={() => scrollFeed('right')}
              aria-label="다음"
              style={{
                position: 'absolute', top: '50%', right: '-16px', transform: 'translateY(-50%)',
                zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
                background: 'white', border: '1px solid #ffeef2',
                boxShadow: '0 4px 10px rgba(255, 32, 112, 0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
                transition: 'all 0.2s'
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
