import React, { useState, useEffect } from 'react';
import { boardApi } from '../api/board';
import { useAuthStore } from '../store';
import Avatar from './Avatar';

export default function ShortsCommentModal({ postId, onClose, onUpdateCount, inline = false }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // States for Editing & Replying
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyNickname, setReplyNickname] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});

  const { token, nickname } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await boardApi.getComments(postId);
      setComments(data);
      if (onUpdateCount) onUpdateCount(data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (parentId) => {
    setExpandedReplies(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      const requestData = {
        targetId: postId,
        targetType: 'POST',
        content: newComment,
        ...(replyToId && { parentId: replyToId })
      };
      await boardApi.createComment(requestData);
      setNewComment('');
      setReplyToId(null);
      setReplyNickname('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await boardApi.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

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
    }
  };

  return (
    <div style={{
      position: inline ? 'relative' : 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: inline ? 'transparent' : 'rgba(0,0,0,0.5)',
      zIndex: inline ? 1 : 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: inline ? 'flex-start' : 'flex-end',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          height: inline ? '100%' : '75%',
          background: '#1a1a1a',
          color: '#f1f1f1',
          borderTopLeftRadius: inline ? '0' : '20px',
          borderTopRightRadius: inline ? '0' : '20px',
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: inline ? 'none' : '0 -4px 20px rgba(0,0,0,0.2)',
          animation: inline ? 'none' : 'slideUp 0.3s ease-out forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}
        </style>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #333' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>댓글 {comments.length}</h3>
          {!inline && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#f1f1f1' }}>✖</button>
          )}
        </div>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>로딩 중...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>가장 먼저 댓글을 남겨보세요!</div>
          ) : (
            (() => {
              const commentMap = {};
              comments.forEach(c => {
                const pId = c.parentId || 'root';
                if (!commentMap[pId]) commentMap[pId] = [];
                commentMap[pId].push(c);
              });

              const renderCommentTree = (parentId = 'root', depth = 0) => {
                const list = commentMap[parentId] || [];
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                return list.map(c => {
                  const isEditing = editingCommentId === c.id;
                  const childComments = commentMap[c.id] || [];
                  const hasChildren = childComments.length > 0;
                  const isExpanded = expandedReplies[c.id];
                  return (
                    <div key={c.id}>
                      <div style={{ marginLeft: depth > 0 ? '3.4rem' : '0', display: 'flex', gap: '12px', marginBottom: '1rem' }}>
                        
                        {/* Avatar */}
                        <div style={{ marginTop: '2px' }}>
                          <Avatar name={c.nickname} imageUrl={c.profileImageUrl} size={depth > 0 ? 28 : 36} />
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: depth > 0 ? '0.85rem' : '0.9rem', color: '#f1f1f1' }}>
                              {c.nickname}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                              {new Date(c.createdAt).toLocaleDateString().slice(5)}
                            </span>
                          </div>

                          {/* Text or Edit Form */}
                          {isEditing ? (
                            <form onSubmit={(e) => handleCommentEditSubmit(e, c.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                              <textarea 
                                value={editingText} 
                                onChange={(e) => setEditingText(e.target.value)} 
                                style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #555', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#333', color: '#fff' }}
                                required autoFocus
                              />
                              <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>완료</button>
                                <button type="button" onClick={() => { setEditingCommentId(null); setEditingText(''); }} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>취소</button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ fontSize: '0.95rem', color: '#f1f1f1', lineHeight: '1.5', wordBreak: 'break-word', marginTop: '2px', marginBottom: '2px' }}>
                              {depth > 0 && c.parentId && (
                                <span style={{ color: '#4da6ff', marginRight: '4px', fontSize: '0.9rem' }}>
                                  @{comments.find(p => p.id === c.parentId)?.nickname}
                                </span>
                              )}
                              {c.content}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
                            {token && !isEditing && (
                              <button type="button" onClick={() => { setReplyToId(c.id); setReplyNickname(c.nickname); setNewComment(''); }} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>답글 달기</button>
                            )}
                            {nickname === c.nickname && !isEditing && (
                              <>
                                <button type="button" onClick={() => { setEditingCommentId(c.id); setEditingText(c.content); }} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>수정</button>
                                <button type="button" onClick={() => handleCommentDelete(c.id)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>삭제</button>
                              </>
                            )}
                          </div>

                          {/* Reply form for this specific comment */}
                          {replyToId === c.id && (
                            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.8rem' }}>
                              <div style={{ marginTop: '2px' }}>
                                <Avatar name={nickname} imageUrl={useAuthStore.getState().profileImageUrl} size={24} />
                              </div>
                              <input 
                                type="text" 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder={`@${c.nickname}님에게 답글 남기기...`}
                                style={{ flex: 1, height: '32px', border: 'none', borderBottom: '1px solid #555', fontSize: '0.85rem', outline: 'none', background: 'transparent', color: '#fff' }}
                                required autoFocus
                              />
                              <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>게시</button>
                              <button type="button" onClick={() => { setReplyToId(null); setReplyNickname(''); setNewComment(''); }} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>✖</button>
                            </form>
                          )}
                        </div>
                      </div>

                      {/* Render children recursively OUTSIDE the flex row */}
                      {hasChildren && depth === 0 && !isExpanded && (
                        <div style={{ marginLeft: '3.4rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                          <button 
                            onClick={() => toggleReplies(c.id)}
                            style={{ background: 'none', border: 'none', color: '#065fd4', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '16px', background: 'rgba(6,95,212,0.05)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                               <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            답글 {childComments.length}개
                          </button>
                        </div>
                      )}

                      {hasChildren && (depth > 0 || isExpanded) && (
                        <div style={{ position: 'relative' }}>
                           {/* YouTube style reply line */}
                           {depth === 0 && (
                             <div style={{ position: 'absolute', left: '17px', top: '-1rem', bottom: '1rem', width: '2px', background: '#444', zIndex: 0 }} />
                           )}
                           <div style={{ position: 'relative', zIndex: 1 }}>
                             {renderCommentTree(c.id, depth + 1)}
                           </div>
                           
                           {/* Collapse button at the bottom */}
                           {depth === 0 && (
                             <div style={{ marginLeft: '3.4rem', marginBottom: '1rem' }}>
                               <button 
                                 onClick={() => toggleReplies(c.id)}
                                 style={{ background: 'none', border: 'none', color: '#065fd4', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '16px', background: 'rgba(6,95,212,0.05)' }}
                               >
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                 </svg>
                                 간략히 보기
                               </button>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  );
                });
              };

              return renderCommentTree();
            })()
          )}
        </div>

        {/* Root Comment Input Form (Hidden if replying to someone) */}
        {!replyToId && (
          <div style={{ padding: '12px 1rem', borderTop: '1px solid #333', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar name={nickname || 'guest'} imageUrl={useAuthStore.getState().profileImageUrl} size={32} />
            <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`${nickname || '사용자'}님으로 댓글 달기...`}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent', height: '36px', color: '#fff' }}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                style={{ 
                  background: 'none', 
                  color: newComment.trim() ? 'var(--primary-color)' : '#b3e0ff', // Faded blue/pink depending on primary color when disabled
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: newComment.trim() ? 'pointer' : 'default', 
                  fontSize: '0.95rem', 
                  padding: '0 8px',
                  opacity: newComment.trim() ? 1 : 0.5
                }}
              >
                게시
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
