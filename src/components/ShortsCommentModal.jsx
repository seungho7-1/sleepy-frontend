import React, { useState, useEffect } from 'react';
import { boardApi } from '../api/board';
import { useAuthStore } from '../store';
import Avatar from './Avatar';
import { formatDate } from '../utils/formatDate';
import { Heart, X, MoreVertical, Flag } from 'lucide-react';

export default function ShortsCommentModal({ postId, onClose, onUpdateCount, inline = false }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // States for Editing & Replying & Options Menu
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyNickname, setReplyNickname] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);

  const { token, nickname } = useAuthStore();

  const handleReportComment = async (commentId, commentNickname) => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (window.confirm(`'${commentNickname}'님의 댓글을 신고하시겠습니까?`)) {
      try {
        await boardApi.report({
          targetType: 'COMMENT',
          targetId: commentId,
          reason: '부적절한 댓글/스팸'
        });
        alert('신고가 접수되었습니다. 관리자 검토 후 조치될 예정입니다.');
      } catch (err) {
        alert(err.message || '신고 접수에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const hash = window.location.hash || location.hash;
    if (comments.length > 0 && hash && hash.includes('comment')) {
      const hashId = hash.replace('#', '');
      const element = document.getElementById(hashId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1200);
      }
    }
  }, [comments, window.location.hash]);

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
      position: inline ? 'relative' : 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: inline ? 'transparent' : 'rgba(0,0,0,0.6)',
      zIndex: inline ? 1 : 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: inline ? 'flex-start' : 'flex-end',
    }} onClick={inline ? undefined : onClose}>
      <div 
        style={{
          width: '100%',
          height: inline ? '100%' : '75%',
          background: '#181818',
          color: '#f1f1f1',
          borderTopLeftRadius: inline ? '0' : '20px',
          borderTopRightRadius: inline ? '0' : '20px',
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: inline ? 'none' : '0 -4px 20px rgba(0,0,0,0.4)',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', borderBottom: '1px solid #2a2a2a' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#f1f1f1' }}>댓글 {comments.length}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>로딩 중...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>가장 먼저 댓글을 남겨보세요!</div>
          ) : (
            (() => {
              const commentMap = {};
              const commentById = {};
              comments.forEach(c => {
                commentById[c.id] = c;
                const pId = c.parentId || 'root';
                if (!commentMap[pId]) commentMap[pId] = [];
                commentMap[pId].push(c);
              });

              const rootComments = commentMap['root'] || [];
              rootComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

              // Helper to get all descendants for a root comment
              const getAllDescendants = (parentId) => {
                let list = [];
                const directChildren = commentMap[parentId] || [];
                directChildren.forEach(child => {
                  list.push(child);
                  list = list.concat(getAllDescendants(child.id));
                });
                return list;
              };

              // Helper to trigger reply mode for any comment
              const handleReplyClick = (rootId, targetComment) => {
                setReplyToId(targetComment.id);
                setReplyNickname(targetComment.nickname);
                setNewComment('');
                setExpandedReplies(prev => ({ ...prev, [rootId]: true }));
              };

              // Render Inline Reply Input Form
              const renderInlineReplyForm = () => (
                <form 
                  onSubmit={handleCommentSubmit} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', width: '100%' }}
                >
                  <Avatar name={nickname || 'guest'} imageUrl={useAuthStore.getState().profileImageUrl} size={24} />
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder={`@${replyNickname}님에게 답글 남기기...`}
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      borderBottom: '1px solid #555', 
                      background: 'transparent', 
                      color: '#fff', 
                      fontSize: '0.85rem', 
                      padding: '4px 0', 
                      outline: 'none' 
                    }}
                    required
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: newComment.trim() ? '#ff70a0' : '#666', 
                      fontWeight: 'bold', 
                      fontSize: '0.85rem', 
                      cursor: newComment.trim() ? 'pointer' : 'default',
                      padding: '0 4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    게시
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setReplyToId(null); setReplyNickname(''); setNewComment(''); }} 
                    style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '0.9rem', cursor: 'pointer', padding: '0 4px' }}
                  >
                    ✕
                  </button>
                </form>
              );

              return rootComments.map(root => {
                const isEditingRoot = editingCommentId === root.id;
                const descendants = getAllDescendants(root.id);
                descendants.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const isExpanded = expandedReplies[root.id];

                return (
                  <div id={`comment-${root.id}`} key={root.id} style={{ marginBottom: '1.4rem', position: 'relative' }}>
                    {/* Gap line for root comment's children */}
                    {isExpanded && descendants.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '36px', // Bottom of 36px avatar
                        bottom: '0', // Down to the reply tree
                        left: '17px', // Center of 36px avatar (18 - 1px border)
                        width: '2px',
                        background: 'rgba(255,255,255,0.15)',
                        zIndex: 0,
                        pointerEvents: 'none'
                      }} />
                    )}

                    {/* Root Comment */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                      <Avatar name={root.nickname} imageUrl={root.profileImageUrl} size={36} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header: Nickname + Date + Options */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#ffffff' }}>
                              {root.nickname}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                              {formatDate(root.createdAt, true)}
                            </span>
                          </div>

                          <div style={{ position: 'relative' }}>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === root.id ? null : root.id); }}
                              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                              title="옵션"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenuId === root.id && (
                              <div 
                                style={{
                                  position: 'absolute', top: '100%', right: 0,
                                  background: '#282828', borderRadius: '8px', padding: '4px 0',
                                  minWidth: '100px', boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                                  border: '1px solid #383838', zIndex: 100
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleReportComment(root.id, root.nickname); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#f1f1f1', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}
                                >
                                  <Flag size={14} color="#ff4d4d" />
                                  신고
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content or Edit Form */}
                        {isEditingRoot ? (
                          <form onSubmit={(e) => handleCommentEditSubmit(e, root.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem', background: '#222', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444' }}>
                            <textarea 
                              value={editingText} 
                              onChange={(e) => setEditingText(e.target.value)} 
                              style={{ 
                                width: '100%', minHeight: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #444', 
                                background: '#141414', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' 
                              }}
                              required
                              autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button 
                                type="button" 
                                onClick={() => { setEditingCommentId(null); setEditingText(''); }} 
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#ddd', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                취소
                              </button>
                              <button type="submit" style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                수정 완료
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ fontSize: '0.92rem', color: '#f1f1f1', marginTop: '4px', lineHeight: '1.45', wordBreak: 'break-word' }}>
                            {root.content}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                          {token && !isEditingRoot && (
                            <button 
                              type="button" 
                              onClick={() => handleReplyClick(root.id, root)}
                              style={{ background: 'none', border: 'none', color: '#aaaaaa', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                            >
                              답글 달기
                            </button>
                          )}
                          {nickname === root.nickname && !isEditingRoot && (
                            <>
                              <button 
                                type="button" 
                                onClick={() => { setEditingCommentId(root.id); setEditingText(root.content); }}
                                style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                              >
                                수정
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleCommentDelete(root.id)}
                                style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>

                        {/* Inline Reply Form under root comment if selected */}
                        {replyToId === root.id && renderInlineReplyForm()}

                        {/* Expand Button if replies exist and not expanded */}
                        {descendants.length > 0 && !isExpanded && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(root.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '10px',
                              padding: '5px 14px',
                              borderRadius: '18px',
                              background: 'rgba(62, 166, 255, 0.12)',
                              border: 'none',
                              color: '#3ea6ff',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.75rem' }}>▼</span>
                            <span>답글 {descendants.length}개</span>
                          </button>
                        )}

                        {/* Threaded Section for Replies when expanded */}
                        {isExpanded && descendants.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            {(() => {
                              const renderReplyTree = (parentId, depth = 1) => {
                                const children = commentMap[parentId] || [];
                                if (children.length === 0) return null;
                                children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                                const lineReach = depth === 1 ? 30 : 20;

                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {children.map((reply, index) => {
                                      const isLast = index === children.length - 1;
                                      const hasChildren = (commentMap[reply.id] || []).length > 0;
                                      const isEditingReply = editingCommentId === reply.id;
                                      const parentComment = commentById[reply.parentId];

                                      return (
                                        <div id={`comment-${reply.id}`} key={reply.id} style={{ position: 'relative', marginTop: index === 0 ? '0' : '12px' }}>
                                          
                                          {/* 1. Curve to THIS child (overlaps with parent gap line or previous sibling DOWN line) */}
                                          <div style={{
                                            position: 'absolute',
                                            top: index === 0 ? '-100px' : '-12px',
                                            left: `-${lineReach}px`,
                                            width: `${lineReach}px`,
                                            height: index === 0 ? '112px' : '24px', // Ends at avatar center (12px)
                                            borderLeft: '2px solid rgba(255,255,255,0.15)',
                                            borderBottom: '2px solid rgba(255,255,255,0.15)',
                                            borderBottomLeftRadius: '12px',
                                            zIndex: 0,
                                            pointerEvents: 'none'
                                          }} />

                                          {/* 2. DOWN line to next sibling */}
                                          {!isLast && (
                                            <div style={{
                                              position: 'absolute',
                                              top: '12px',
                                              bottom: '-12px',
                                              left: `-${lineReach}px`,
                                              borderLeft: '2px solid rgba(255,255,255,0.15)',
                                              zIndex: 0,
                                              pointerEvents: 'none'
                                            }} />
                                          )}

                                          {/* Content Wrapper */}
                                          <div style={{ position: 'relative' }}>
                                            {/* 3. Gap line for THIS child's children (if any) */}
                                            {hasChildren && (
                                              <div style={{
                                                position: 'absolute',
                                                top: '24px',
                                                bottom: '0',
                                                left: '11px',
                                                width: '2px',
                                                background: 'rgba(255,255,255,0.15)',
                                                zIndex: 0,
                                                pointerEvents: 'none'
                                              }} />
                                            )}
                                            
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                              <Avatar name={reply.nickname} imageUrl={reply.profileImageUrl} size={24} />
                                              
                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Reply Header: Nickname + Date + Options */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#ffffff' }}>
                                                      {reply.nickname}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#888888', marginLeft: '4px' }}>
                                                      {formatDate(reply.createdAt, true)}
                                                    </span>
                                                  </div>

                                                  <div style={{ position: 'relative' }}>
                                                    <button 
                                                      type="button" 
                                                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === reply.id ? null : reply.id); }}
                                                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                      title="옵션"
                                                    >
                                                      <MoreVertical size={16} />
                                                    </button>

                                                    {openMenuId === reply.id && (
                                                      <div 
                                                        style={{
                                                          position: 'absolute', top: '100%', right: 0,
                                                          background: '#282828', borderRadius: '8px', padding: '4px 0',
                                                          minWidth: '100px', boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                                                          border: '1px solid #383838', zIndex: 100
                                                        }}
                                                      >
                                                        <button
                                                          type="button"
                                                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleReportComment(reply.id, reply.nickname); }}
                                                          style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#f1f1f1', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}
                                                        >
                                                          <Flag size={14} color="#ff4d4d" />
                                                          신고
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Reply Content */}
                                                {isEditingReply ? (
                                                  <form onSubmit={(e) => handleCommentEditSubmit(e, reply.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem', background: '#222', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444' }}>
                                                    <textarea 
                                                      value={editingText} 
                                                      onChange={(e) => setEditingText(e.target.value)} 
                                                      style={{ 
                                                        width: '100%', minHeight: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #444', 
                                                        background: '#141414', color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' 
                                                      }}
                                                      required
                                                      autoFocus
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                      <button 
                                                        type="button" 
                                                        onClick={() => { setEditingCommentId(null); setEditingText(''); }} 
                                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#ddd', fontSize: '0.8rem', cursor: 'pointer' }}
                                                      >
                                                        취소
                                                      </button>
                                                      <button type="submit" style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                        수정 완료
                                                      </button>
                                                    </div>
                                                  </form>
                                                ) : (
                                                  <div style={{ fontSize: '0.88rem', color: '#f1f1f1', marginTop: '4px', lineHeight: '1.45', wordBreak: 'break-word' }}>
                                                    {parentComment && parentComment.id !== root.id && (
                                                      <span style={{ 
                                                        color: '#3ea6ff', 
                                                        fontWeight: '600', 
                                                        marginRight: '6px'
                                                      }}>
                                                        @{parentComment.nickname}
                                                      </span>
                                                    )}
                                                    {reply.content}
                                                  </div>
                                                )}

                                                {/* Reply Actions */}
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                                                  {token && !isEditingReply && (
                                                    <button 
                                                      type="button" 
                                                      onClick={() => handleReplyClick(root.id, reply)}
                                                      style={{ background: 'none', border: 'none', color: '#aaaaaa', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                                    >
                                                      답글 달기
                                                    </button>
                                                  )}
                                                  {nickname === reply.nickname && !isEditingReply && (
                                                    <>
                                                      <button 
                                                        type="button" 
                                                        onClick={() => { setEditingCommentId(reply.id); setEditingText(reply.content); }}
                                                        style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                                                      >
                                                        수정
                                                      </button>
                                                      <button 
                                                        type="button" 
                                                        onClick={() => handleCommentDelete(reply.id)}
                                                        style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                                                      >
                                                        삭제
                                                      </button>
                                                    </>
                                                  )}
                                                </div>

                                                {/* Inline Reply Form under this specific reply */}
                                                {replyToId === reply.id && renderInlineReplyForm()}

                                                {/* Recursive Children */}
                                                {hasChildren && (
                                                  <div style={{ marginTop: '12px' }}>
                                                    {renderReplyTree(reply.id, depth + 1)}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              };

                              return renderReplyTree(root.id, 1);
                            })()}
                            
                            {/* Collapse Button */}
                            <button
                              type="button"
                              onClick={() => toggleReplies(root.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '12px',
                                padding: '5px 14px',
                                borderRadius: '18px',
                                background: 'rgba(62, 166, 255, 0.12)',
                                border: 'none',
                                color: '#3ea6ff',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                position: 'relative',
                                zIndex: 1
                              }}
                            >
                              <span style={{ fontSize: '0.75rem' }}>▲</span>
                              <span>간략히 보기</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Root Comment Input Form (Hidden if replying to someone) */}
        {!replyToId && (
          <div style={{ padding: '12px 1rem', borderTop: '1px solid #2a2a2a', background: '#181818', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar name={nickname || 'guest'} imageUrl={useAuthStore.getState().profileImageUrl} size={30} />
            <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 추가..."
                style={{ flex: 1, border: 'none', borderBottom: '1px solid #444', outline: 'none', fontSize: '0.9rem', background: 'transparent', height: '32px', color: '#fff' }}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                style={{ 
                  background: 'none', 
                  color: newComment.trim() ? '#3ea6ff' : '#555', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: newComment.trim() ? 'pointer' : 'default', 
                  fontSize: '0.9rem', 
                  padding: '0 8px'
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
