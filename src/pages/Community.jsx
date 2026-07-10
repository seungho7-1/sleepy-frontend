import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { boardApi } from '../api/board'
import PostItem from '../components/PostItem'
import MediaPostItem from '../components/MediaPostItem'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { label: '최근 등록순', value: 'createdAt,desc' },
  { label: '오래된순', value: 'createdAt,asc' },
  { label: '조회 많은순', value: 'viewCount,desc' },
  { label: '좋아요 많은순', value: 'likeCount,desc' },
]

export default function Community({ mode = 'all' }) {
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  
  // mode에 따라 기본 게시판 타입 설정
  const defaultBoardType = mode === 'gallery' ? 'MEDIA' : (mode === 'lounge' ? 'NOTICE' : (searchParams.get('tab') || 'FREE'))
  const [boardType, setBoardType] = useState(defaultBoardType)

  // Pagination state (공지/자유/질문 전용)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt,desc')
  
  useEffect(() => {
    // 탭 변경 시 페이지와 정렬을 초기화
    setPage(0)
    setSortBy('createdAt,desc')
  }, [boardType])
  
  // 모드가 변경되면 탭도 강제 변경
  useEffect(() => {
    if (mode === 'gallery') setBoardType('MEDIA')
    if (mode === 'lounge') setBoardType('NOTICE')
  }, [mode])

  useEffect(() => {
    fetchPosts()
  }, [boardType, page, sortBy])

  const fetchPosts = async () => {
    try {
      const isMedia = boardType === 'MEDIA'
      const data = await boardApi.getPosts(
        boardType,
        isMedia ? 0 : page,
        isMedia ? 50 : PAGE_SIZE,
        sortBy
      )
      setPosts(data.content || [])
      if (!isMedia) {
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
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
    <div className="home-container">
      <div className="hero-section" style={{ padding: '2rem 1rem', marginBottom: '2rem' }}>
        <h2>{mode === 'gallery' ? '슬라임 갤러리 ✨' : mode === 'lounge' ? 'Q&A 라운지 💬' : 'Sleepy 커뮤니티'}</h2>
        <p>{mode === 'gallery' ? '여러분의 예쁜 슬라임을 마음껏 자랑해보세요!' : '공지사항을 확인하고 자유롭게 질문과 답변을 나누세요.'}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {mode !== 'gallery' && (
          <>
            <button 
              className={`nav-btn ${boardType === 'NOTICE' ? 'admin-btn' : ''}`}
              onClick={() => setBoardType('NOTICE')}
            >
              공지사항
            </button>
            <button 
              className={`nav-btn ${boardType === 'QNA' ? 'admin-btn' : ''}`}
              onClick={() => setBoardType('QNA')}
            >
              질문게시판
            </button>
            {mode === 'all' && (
              <button 
                className={`nav-btn ${boardType === 'FREE' ? 'admin-btn' : ''}`}
                onClick={() => setBoardType('FREE')}
              >
                자유게시판
              </button>
            )}
          </>
        )}
        
        {mode !== 'lounge' && (
          <button 
            className={`nav-btn ${boardType === 'MEDIA' ? 'admin-btn' : ''}`}
            onClick={() => setBoardType('MEDIA')}
            style={{ background: boardType === 'MEDIA' ? 'linear-gradient(135deg, #ff6b8b, #ff8da1)' : '', color: boardType === 'MEDIA' ? 'white' : '' }}
          >
            미디어(자랑)
          </button>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 상단 툴바: 정렬 + 글쓰기 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {/* 정렬 필터 (모든 탭) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSortChange(opt.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: sortBy === opt.value ? '1.5px solid var(--primary-color)' : '1px solid #e0e0e0',
                  background: sortBy === opt.value ? 'var(--primary-color)' : 'white',
                  color: sortBy === opt.value ? 'white' : '#666',
                  fontSize: '0.8rem',
                  fontWeight: sortBy === opt.value ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Link to={`/community/create?boardType=${boardType}`} className="submit-btn" style={{ textDecoration: 'none', padding: '0.5rem 1rem', width: 'auto', flexShrink: 0 }}>
            글쓰기
          </Link>
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
            {/* 게시글 수 표시 */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.8rem' }}>
              총 <strong style={{ color: 'var(--primary-color)' }}>{totalElements}</strong>개의 게시글
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>조회</th>
                    <th>좋아요</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </tbody>
              </table>
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
