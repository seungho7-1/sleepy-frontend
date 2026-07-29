import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { boardApi } from '../../api/board'
import PostItem from '../../components/PostItem'
import MediaPostItem from '../../components/MediaPostItem'
import { Camera, Video, Eye, Heart, MessageCircle, Search } from 'lucide-react';
import { isVideo } from '../../utils/media';

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '조회순', value: 'viewCount,desc' },
  { label: '인기순', value: 'popularityScore,desc' },
  { label: '댓글순', value: 'commentCount,desc' },
]

export default function Community({ mode = 'all' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const tab = searchParams.get('tab')
  
  // mode에 따라 기본 게시판 타입 설정
  const defaultBoardType = mode === 'gallery' ? 'MEDIA' : mode === 'notice' ? 'NOTICE' : (tab || 'ALL')
  const [boardType, setBoardType] = useState(defaultBoardType)

  const handleTabChange = (type) => {
    setBoardType(type)
    setSearchParams({ tab: type })
  }

  // Pagination state (공지/자유/질문 전용)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const initialSearch = searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [keyword, setKeyword] = useState(initialSearch)

  // Sort state
  const [sortBy, setSortBy] = useState(mode === 'lounge' ? 'popularityScore,desc' : 'createdAt,desc')
  
  useEffect(() => {
    // 탭 변경 시 페이지와 정렬을 초기화
    setPage(0)
    if (boardType === 'MEDIA' || boardType === 'NOTICE') {
      setSortBy('createdAt,desc')
    } else {
      setSortBy('popularityScore,desc')
    }
  }, [boardType])
  
  // 모드가 변경되면 탭도 강제 변경
  useEffect(() => {
    if (mode === 'gallery') setBoardType('MEDIA')
    else if (mode === 'notice') setBoardType('NOTICE')
    else if (mode === 'lounge') setBoardType(tab || 'ALL')
  }, [mode, tab])

  useEffect(() => {
    fetchPosts()
  }, [boardType, page, sortBy, keyword])

  const fetchPosts = async () => {
    try {
      const isMedia = boardType === 'MEDIA'
      const data = await boardApi.getPosts(
        boardType,
        keyword.replace(/^#/, ''),
        isMedia ? 0 : page,
        isMedia ? 50 : PAGE_SIZE,
        sortBy
      )
      setPosts(data.content || [])
      setTotalElements(data.totalElements || 0)
      if (!isMedia) {
        setTotalPages(data.totalPages || 0)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 페이지 번호 목록 생성 (최대 5개씩 보여주기)
  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(0, page - 2)
    const endPage = Math.min(totalPages - 1, page + 2)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(0) // 정렬 변경 시 1페이지로 이동
  }

  const isMedia = boardType === 'MEDIA'

  return (
    <div className="home-container" style={{ paddingBottom: '4rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .mobile-hide-search {
            display: none !important;
          }
          .popular-media-card {
            width: calc(50% - 6px) !important;
          }
        }
        .popular-media-card {
          width: calc(25% - 9px);
        }
      `}</style>
      <div className="container" style={{ maxWidth: '968px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="hero-section" style={{ padding: '2rem 0', marginBottom: '1.5rem' }}>
          <h2>{mode === 'gallery' ? '슬라임 갤러리' : mode === 'lounge' ? '커뮤니티' : '공지사항'}</h2>
          <p>{mode === 'gallery' ? '여러분의 예쁜 슬라임을 마음껏 자랑해보세요!' : mode === 'lounge' ? '슬라임에 대한 다양한 이야기를 자유롭게 나누세요.' : '슬리피의 주요 공지사항을 확인하세요.'}</p>
        </div>

        {/* 카테고리 탭 (갤러리, 공지사항 모드가 아닐 때만 표시) */}
        {mode !== 'gallery' && mode !== 'notice' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: '전체' },
              { id: 'QNA', label: '질문' },
              { id: 'REVIEW', label: '후기' },
              { id: 'INFO', label: '정보' },
              { id: 'FREE', label: '잡담' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: boardType === cat.id ? 'none' : '1px solid #eee',
                  background: boardType === cat.id ? 'var(--primary-color)' : 'white',
                  color: boardType === cat.id ? 'white' : '#666',
                  fontWeight: boardType === cat.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: boardType === cat.id ? '0 4px 10px rgba(255, 32, 112, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
        
        {/* 상단 툴바: 정렬 + 총 게시글 + 검색창 + 글쓰기 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* 왼쪽: 정렬, 총개수 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '0.9rem',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'white url("data:image/svg+xml;utf8,<svg fill=\'%23333\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>") no-repeat right 8px center',
                backgroundSize: '20px',
                paddingRight: '32px'
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
              총 <strong style={{ color: 'var(--primary-color)' }}>{totalElements}</strong>개
            </div>
          </div>

          {/* 오른쪽: 검색창, 글쓰기 */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <div className="mobile-hide-search" style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '280px', width: '100%' }}>
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setKeyword(searchInput)
                    setPage(0)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  paddingRight: searchInput ? '3.5rem' : '2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--text-main)'; e.target.style.background = 'var(--bg-color)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-secondary)'; }}
              />
              {searchInput && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchInput('');
                    setKeyword('');
                    setPage(0);
                  }}
                  style={{
                    position: 'absolute',
                    right: '2.2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="검색어 지우기"
                >
                  ✖
                </button>
              )}
              <button 
                onClick={() => {
                  setKeyword(searchInput)
                  setPage(0)
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <Link to={`/community/create?boardType=${boardType}`} className="submit-btn" style={{ textDecoration: 'none', padding: '0.55rem 1.2rem', width: 'auto', flexShrink: 0, marginTop: 0, borderRadius: '20px', fontSize: '0.9rem' }}>
              글쓰기
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">등록된 글이 없습니다.</div>
        ) : boardType === 'MEDIA' ? (
          <div className="media-grid">
            {posts.map(post => (
              <MediaPostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <>

            <div style={{ 
              borderTop: '2px solid var(--text-main)', 
              borderBottom: '1px solid var(--border-color)',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              borderRadius: '4px'
            }}>
              {posts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages >= 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2rem',
                marginBottom: '1rem',
              }}>
                {/* 맨 처음 */}
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid #eee', background: 'white',
                    color: page === 0 ? '#ccc' : '#555',
                    cursor: page === 0 ? 'default' : 'pointer',
                    fontSize: '0.8rem', fontWeight: '600',
                  }}
                >
                  ««
                </button>

                {/* 이전 */}
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid #eee', background: 'white',
                    color: page === 0 ? '#ccc' : '#555',
                    cursor: page === 0 ? 'default' : 'pointer',
                    fontSize: '0.9rem', fontWeight: '600',
                  }}
                >
                  ‹
                </button>

                {/* 페이지 번호 */}
                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: num === page ? '1.5px solid var(--primary-color)' : '1px solid #eee',
                      background: num === page ? 'var(--primary-color)' : 'white',
                      color: num === page ? 'white' : '#555',
                      cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: num === page ? '700' : '500',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {num + 1}
                  </button>
                ))}

                {/* 다음 */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid #eee', background: 'white',
                    color: page >= totalPages - 1 ? '#ccc' : '#555',
                    cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    fontSize: '0.9rem', fontWeight: '600',
                  }}
                >
                  ›
                </button>

                {/* 맨 끝 */}
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid #eee', background: 'white',
                    color: page >= totalPages - 1 ? '#ccc' : '#555',
                    cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    fontSize: '0.8rem', fontWeight: '600',
                  }}
                >
                  »»
                </button>
              </div>
            )}

            {/* 현재 페이지 정보 */}
            {totalPages >= 1 && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
                {page + 1} / {totalPages} 페이지
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
