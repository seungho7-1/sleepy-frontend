import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { boardApi } from '../api/board'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    try {
      const data = await boardApi.getPostDetail(id);
      setPost(data);
    } catch (err) {
      alert('게시글을 찾을 수 없습니다.');
      navigate('/community');
    }
  }

  const fetchComments = async () => {
    try {
      const data = await boardApi.getComments(id, 'POST');
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  }

  const toggleLike = async () => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    try {
      await boardApi.toggleLike(id, 'POST');
      fetchPost();
    } catch (err) {
      console.error(err);
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      await boardApi.createComment({
        targetId: id,
        targetType: 'POST',
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  }

  if (!post) return <div className="empty-state">로딩 중...</div>

  return (
    <div className="detail-container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← 목록으로</button>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
          [{post.boardType === 'FREE' ? '자유' : post.boardType === 'QNA' ? '질문' : post.boardType === 'MEDIA' ? '미디어' : '공지'}]
        </div>
        <h1 style={{ margin: '1rem 0' }}>{post.title}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '1rem', color: '#666' }}>
          <div>작성자: <strong>{post.nickname}</strong></div>
          <div>{new Date(post.createdAt).toLocaleString()} | 조회 {post.viewCount} | 좋아요 {post.likeCount}</div>
        </div>
        
        {post.imageUrl && (
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            {post.imageUrl.match(/\.(mp4|webm)$/i) ? (
              <video src={post.imageUrl} controls style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '600px' }} />
            ) : (
              <img src={post.imageUrl} alt="post media" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '600px', objectFit: 'contain' }} />
            )}
          </div>
        )}

        <div style={{ padding: '2rem 0', minHeight: '100px', lineHeight: '1.6' }}>
          {post.content.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', padding: '2rem 0', borderBottom: '1px solid #eee' }}>
          <button 
            onClick={toggleLike}
            style={{ 
              background: 'var(--primary-color)', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '20px', fontSize: '1.1rem', cursor: 'pointer' 
            }}
          >
            👍 좋아요 {post.likeCount}
          </button>
        </div>
        
        {/* Comments Section */}
        <div style={{ marginTop: '2rem' }}>
          <h3>댓글 ({comments.length})</h3>
          
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="댓글을 남겨보세요."
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              required
            />
            <button type="submit" className="submit-btn" style={{ width: '100px' }}>등록</button>
          </form>
          
          <div>
            {comments.map(c => (
              <div key={c.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f1f1' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{c.nickname}</div>
                <div>{c.content}</div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
