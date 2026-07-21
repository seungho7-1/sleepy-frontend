import React, { useState, useEffect } from 'react';
import { boardApi } from '../api/board';
import { useAuthStore } from '../store';
import Avatar from './Avatar';

export default function ShortsCommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // States for Editing & Replying
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyNickname, setReplyNickname] = useState('');

  const { token, nickname } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await boardApi.getComments(postId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      if (replyToId) {
        await boardApi.createComment(postId, { content: newComment, parentId: replyToId });
      } else {
        await boardApi.createComment(postId, { content: newComment });
      }
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
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          height: '75%',
          background: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.3s ease-out forwards'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>댓글 {comments.length}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>✖</button>
        </div>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>로딩 중...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>가장 먼저 댓글을 남겨보세요!</div>
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
                  return (
                    <div key={c.id} style={{ marginBottom: '1.2rem' }}>
                      <div style={{ marginLeft: depth > 0 ? '3rem' : '0', display: 'flex', gap: '10px' }}>
                        
                        {/* Avatar */}
                        <div style={{ marginTop: '2px' }}>
                          <Avatar name={c.nickname} imageUrl={c.profileImageUrl} size={depth > 0 ? 28 : 36} />
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: depth > 0 ? '0.85rem' : '0.9rem', color: '#262626' }}>
                              {c.nickname}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#8e8e8e' }}>
                              {new Date(c.createdAt).toLocaleDateString().slice(5)}
                            </span>
                          </div>

                          {/* Text or Edit Form */}
                          {isEditing ? (
                            <form onSubmit={(e) => handleCommentEditSubmit(e, c.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                              <textarea 
                                value={editingText} 
                                onChange={(e) => setEditingText(e.target.value)} 
                                style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#fafafa' }}
                                required autoFocus
                              />
                              <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>완료</button>
                                <button type="button" onClick={() => { setEditingCommentId(null); setEditingText(''); }} style={{ background: 'none', border: 'none', color: '#8e8e8e', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>취소</button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ fontSize: '0.95rem', color: '#262626', lineHeight: '1.5', wordBreak: 'break-word', marginTop: '2px', marginBottom: '2px' }}>
                              {depth > 0 && c.parentId && (
                                <span style={{ color: '#00376b', marginRight: '4px', fontSize: '0.9rem' }}>
                                  @{comments.find(p => p.id === c.parentId)?.nickname}
                                </span>
                              )}
                              {c.content}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
                            {token && !isEditing && (
                              <button type="button" onClick={() => { setReplyToId(c.id); setReplyNickname(c.nickname); setNewComment(''); }} style={{ background: 'none', border: 'none', color: '#8e8e8e', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>답글 달기</button>
                            )}
                            {nickname === c.nickname && !isEditing && (
                              <>
                                <button type="button" onClick={() => { setEditingCommentId(c.id); setEditingText(c.content); }} style={{ background: 'none', border: 'none', color: '#8e8e8e', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>수정</button>
                                <button type="button" onClick={() => handleCommentDelete(c.id)} style={{ background: 'none', border: 'none', color: '#8e8e8e', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>삭제</button>
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
                                style={{ flex: 1, height: '32px', border: 'none', borderBottom: '1px solid #dbdbdb', fontSize: '0.85rem', outline: 'none', background: 'transparent' }}
                                required autoFocus
                              />
                              <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>게시</button>
                              <button type="button" onClick={() => { setReplyToId(null); setReplyNickname(''); setNewComment(''); }} style={{ background: 'none', border: 'none', color: '#8e8e8e', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>✖</button>
                            </form>
                          )}
                        </div>
                      </div>

                      {/* Render children recursively OUTSIDE the flex row */}
                      {renderCommentTree(c.id, depth + 1)}
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
          <div style={{ padding: '12px 1rem', borderTop: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar name={nickname || 'guest'} imageUrl={useAuthStore.getState().profileImageUrl} size={32} />
            <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`${nickname || '사용자'}님으로 댓글 달기...`}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent', height: '36px' }}
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
