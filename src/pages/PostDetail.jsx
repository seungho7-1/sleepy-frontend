import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { boardApi } from '../api/board'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, nickname } = useAuthStore()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyToId, setReplyToId] = useState(null)
  const [replyNickname, setReplyNickname] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

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
      navigate(-1);
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
        content: newComment,
        parentId: replyToId
      });
      setNewComment('');
      setReplyToId(null);
      setReplyNickname('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  }

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await boardApi.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error(err);
      alert('댓글 삭제에 실패했습니다.');
    }
  }

  const handleCommentEditSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    try {
      await boardApi.updateComment(commentId, { content: editingText });
      setEditingCommentId(null);
      setEditingText('');
      fetchComments();
    } catch (err) {
      console.error(err);
      alert('댓글 수정에 실패했습니다.');
    }
  }

  if (!post) return <div className="empty-state">로딩 중...</div>

  return (
    <div className="detail-container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← 목록으로</button>
      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
          [{post.boardType === 'FREE' ? '자유' : post.boardType === 'QNA' ? '질문' : post.boardType === 'MEDIA' ? '미디어' : '공지'}]
        </div>
        <h1 style={{ margin: '1rem 0' }}>{post.title}</h1>
        
        <div className="post-meta">
          <div>작성자: <strong>{post.nickname}</strong></div>
          <div>{new Date(post.createdAt).toLocaleString()} <span style={{ color: '#ccc', margin: '0 4px' }}>|</span> 조회 {post.viewCount} <span style={{ color: '#ccc', margin: '0 4px' }}>|</span> 좋아요 {post.likeCount}</div>
        </div>
        
        {post.imageUrl && (
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            {post.imageUrl.match(/\.(mp4|webm|mov|avi)$/i) ? (
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
          
          {/* 새 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              value={replyToId ? '' : newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder={replyToId ? "답글을 쓰려면 아래의 답글 창을 이용해 주세요." : "댓글을 남겨보세요."}
              disabled={!!replyToId}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: replyToId ? '#f5f5f5' : 'white' }}
              required={!replyToId}
            />
            <button type="submit" className="submit-btn" style={{ width: '100px' }} disabled={!!replyToId}>등록</button>
          </form>
          
          <div>
            {(() => {
              if (comments.length === 0) {
                return <div className="empty-state">아직 등록된 댓글이 없습니다.</div>;
              }

              // Group comments by parentId
              const commentMap = {};
              comments.forEach(c => {
                const pId = c.parentId || 'root';
                if (!commentMap[pId]) {
                  commentMap[pId] = [];
                }
                commentMap[pId].push(c);
              });

              const renderCommentTree = (parentId = 'root', depth = 0) => {
                const list = commentMap[parentId] || [];
                // Sort by createdAt ascending
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                return list.map(c => {
                  const isEditing = editingCommentId === c.id;
                  return (
                    <div key={c.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', marginTop: '0.8rem' }}>
                      <div style={{ 
                        padding: '12px 14px', 
                        background: depth > 0 ? '#fffdfd' : 'white', 
                        borderRadius: '8px', 
                        border: '1px solid',
                        borderColor: depth > 0 ? '#ffeef2' : '#f1f1f1',
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {/* Header: nickname and date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 'bold', fontSize: depth > 0 ? '0.85rem' : '0.95rem', color: '#333' }}>
                            {depth > 0 && <span style={{ color: 'var(--primary-color)', marginRight: '6px', fontWeight: 'bold' }}>↳</span>}
                            {c.nickname}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#999' }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Content or Edit Form */}
                        {isEditing ? (
                          <form onSubmit={(e) => handleCommentEditSubmit(e, c.id)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={editingText} 
                              onChange={(e) => setEditingText(e.target.value)} 
                              style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                              required
                              autoFocus
                            />
                            <button type="submit" className="submit-btn" style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box' }}>저장</button>
                            <button 
                              type="button" 
                              onClick={() => { setEditingCommentId(null); setEditingText(''); }} 
                              style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', color: '#666', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box' }}
                            >
                              취소
                            </button>
                          </form>
                        ) : (
                          <div style={{ fontSize: depth > 0 ? '0.9rem' : '0.95rem', color: '#222', lineHeight: '1.5' }}>{c.content}</div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                          {token && !isEditing && (
                            <button 
                              type="button" 
                              onClick={() => { 
                                setReplyToId(c.id); 
                                setReplyNickname(c.nickname); 
                                setNewComment('');
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                            >
                              답글 달기
                            </button>
                          )}
                          {nickname === c.nickname && !isEditing && (
                            <>
                              <button 
                                type="button" 
                                onClick={() => { setEditingCommentId(c.id); setEditingText(c.content); }}
                                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                              >
                                수정
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleCommentDelete(c.id)}
                                style={{ background: 'none', border: 'none', color: '#f44336', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reply form for this specific comment */}
                      {replyToId === c.id && (
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', marginLeft: '1.5rem', padding: '10px', background: '#fff9fa', borderRadius: '8px', border: '1px solid #ffd6e0', alignItems: 'center' }}>
                          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>↳</span>
                          <input 
                            type="text" 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder={`@${c.nickname}님에게 답글 남기기...`}
                            style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                            required
                            autoFocus
                          />
                          <button type="submit" className="submit-btn" style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box' }}>등록</button>
                          <button 
                            type="button" 
                            onClick={() => { setReplyToId(null); setReplyNickname(''); setNewComment(''); }} 
                            style={{ height: '36px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.8rem', color: '#666', background: 'white', cursor: 'pointer', boxSizing: 'border-box' }}
                          >
                            취소
                          </button>
                        </form>
                      )}

                      {/* Render children recursively */}
                      {renderCommentTree(c.id, depth + 1)}
                    </div>
                  );
                });
              };

              return renderCommentTree();
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
