import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { boardApi } from '../api/board'
import PostItem from '../components/PostItem'
import MediaPostItem from '../components/MediaPostItem'

export default function Community() {
  const [posts, setPosts] = useState([])
  const [boardType, setBoardType] = useState('FREE') // FREE, QNA, NOTICE
  
  useEffect(() => {
    fetchPosts()
  }, [boardType])

  const fetchPosts = async () => {
    try {
      const data = await boardApi.getPosts(boardType, 0, 20);
      setPosts(data.content || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="home-container">
      <div className="hero-section" style={{ padding: '2rem 1rem', marginBottom: '2rem' }}>
        <h2>SlimeHub 커뮤니티 💬</h2>
        <p>슬라임 정보를 공유하고 자유롭게 소통하세요.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <button 
          className={`nav-btn ${boardType === 'NOTICE' ? 'admin-btn' : ''}`}
          onClick={() => setBoardType('NOTICE')}
        >
          공지사항
        </button>
        <button 
          className={`nav-btn ${boardType === 'FREE' ? 'admin-btn' : ''}`}
          onClick={() => setBoardType('FREE')}
        >
          자유게시판
        </button>
        <button 
          className={`nav-btn ${boardType === 'QNA' ? 'admin-btn' : ''}`}
          onClick={() => setBoardType('QNA')}
        >
          질문게시판
        </button>
        <button 
          className={`nav-btn ${boardType === 'MEDIA' ? 'admin-btn' : ''}`}
          onClick={() => setBoardType('MEDIA')}
          style={{ background: boardType === 'MEDIA' ? 'linear-gradient(135deg, #ff6b8b, #ff8da1)' : '', color: boardType === 'MEDIA' ? 'white' : '' }}
        >
          📷 미디어(사진/영상)
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Link to="/community/create" className="submit-btn" style={{ textDecoration: 'none', padding: '0.5rem 1rem', width: 'auto' }}>
            글쓰기
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">등록된 글이 없습니다.</div>
        ) : boardType === 'MEDIA' ? (
          <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {posts.map(post => (
              <MediaPostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
