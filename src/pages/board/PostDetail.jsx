import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { boardApi } from '../../api/board'
import { formatDate } from '../../utils/formatDate'
import { Heart, Flag } from 'lucide-react'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, nickname, role } = useAuthStore()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyToId, setReplyToId] = useState(null)
  const [replyNickname, setReplyNickname] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')
  
  // 신고 관련 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportTargetType, setReportTargetType] = useState('POST')
  const [reportTargetId, setReportTargetId] = useState(id)
  const [reportReasonOption, setReportReasonOption] = useState('영리목적/홍보성')
  const [customReportReason, setCustomReportReason] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    const fetchPostAndView = async () => {
      try {
        // 1. 조회수 증가 API 호출 (비동기로 던져두거나 await 처리)
        await boardApi.incrementViewCount(id).catch(e => console.error('조회수 증가 실패:', e));
        
        // 2. 게시글 상세 데이터 가져오기 (전체 데이터 보장)
        const postData = await boardApi.getPostDetail(id);
        setPost(postData);
      } catch (err) {
        console.error('게시글 로딩에 실패했습니다:', err);
        alert('게시글을 찾을 수 없습니다.');
        navigate(-1);
      }
    };

    fetchPostAndView();
    fetchComments(); // 댓글 로딩은 별도로 실행합니다.

  }, [id]); // id가 바뀔 때마다 실행됩니다.

  const fetchPost = async () => {
    try {
      const data = await boardApi.getPostDetail(id);
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await boardApi.getComments(id, 'POST');
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToHash = () => {
    const currentHash = window.location.hash || location.hash;
    if (comments.length > 0 && currentHash) {
      const hashId = currentHash.replace('#', '');
      const element = document.getElementById(hashId);
      if (element) {
        // 첫 시도 (약간의 지연 후)
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        
        // 이미지 등 비동기 리소스 로딩으로 위치가 밀릴 수 있으므로 1.2초 후 다시 한번 위치 조정
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1200);
      }
    }
  };

  useEffect(() => {
    scrollToHash();
    
    // 외부에서 window.location.hash 변경 시에도 감지하기 위한 리스너
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [comments, location.hash, post]);

  const toggleLike = async () => {
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    try {
      const res = await boardApi.toggleLike(id, 'POST');
      const liked = res.liked !== undefined ? res.liked : res.isLiked;
      
      setPost(prev => {
        return {
          ...prev,
          likeCount: res.likeCount,
          isLiked: liked
        };
      });
    } catch (err) {
      console.error('좋아요 에러:', err);
    } finally {
      setIsLiking(false);
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    if (!newComment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
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
    } finally {
      setIsSubmittingComment(false);
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

  const handlePostDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await boardApi.deletePost(id);
      alert('삭제되었습니다.');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('게시글 삭제에 실패했습니다.');
    }
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const finalReason = reportReasonOption === '기타' ? customReportReason : reportReasonOption;
    if (!finalReason.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    
    setSubmittingReport(true);
    try {
      await boardApi.report({
        targetType: reportTargetType,
        targetId: reportTargetId,
        reason: finalReason
      });
      alert('신고가 성공적으로 접수되었습니다. 관리자 확인 후 처리됩니다.');
      setIsReportModalOpen(false);
      setCustomReportReason('');
      setReportReasonOption('영리목적/홍보성');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '신고 접수에 실패했습니다.');
    } finally {
      setSubmittingReport(false);
    }
  }

  if (!post) return <div className="empty-state">로딩 중...</div>

  const isAuthor = nickname === post.nickname;
  const isAdmin = role === 'ADMIN';

  return (
    <div className="container" style={{ margin: '2rem auto', maxWidth: '968px', width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            color: '#666',
            fontWeight: '600',
            padding: '8px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
          onMouseLeave={(e) => e.target.style.color = '#666'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          목록으로 가기
        </button>

      </div>
      
      <div style={{ background: 'white', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          [{post.boardType === 'FREE' ? '잡담' : post.boardType === 'QNA' ? '질문' : post.boardType === 'REVIEW' ? '후기' : post.boardType === 'INFO' ? '정보' : post.boardType === 'MEDIA' ? '미디어' : '공지'}]
        </div>
        <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', lineHeight: '1.4', color: '#111' }}>{post.title}</h1>
        
        <div className="post-meta">
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '16px', rowGap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#888', fontSize: '0.95rem' }}>작성자</span>
              <strong style={{ color: '#333', fontSize: '1.05rem' }}>{post.nickname}</strong>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: '#888', fontSize: '0.95rem' }}>
              <span>{formatDate(post.createdAt)}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ccc' }} />
              <span>좋아요 {post.likeCount}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ccc' }} />
              <span>조회 {post.viewCount}</span>
            </div>
          </div>
            
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {(isAuthor || isAdmin) && (
              <>
                <button 
                  onClick={() => navigate(`/community/create?edit=${id}`)}
                  style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#555', fontWeight: '600' }}
                >
                  수정
                </button>
                <button 
                  onClick={handlePostDelete}
                  style={{ background: '#fff0f2', border: '1px solid #ffccd8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600' }}
                >
                  삭제
                </button>
              </>
            )}
            {token && !isAuthor && role !== 'ADMIN' && (
              <button 
                onClick={() => { setReportTargetType('POST'); setReportTargetId(id); setIsReportModalOpen(true); }}
                style={{ background: '#ffffff', border: '1px solid #eeeeee', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#666666', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Flag size={14} color="var(--primary-color)" />
                신고
              </button>
            )}
          </div>
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
          {(post.content || '').split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', padding: '3rem 0', borderBottom: '1px solid #eee' }}>
          <button 
            onClick={toggleLike}
            disabled={isLiking}
            style={{ 
              background: post.isLiked ? '#fff0f5' : 'white',
              color: post.isLiked ? 'var(--primary-color)' : 'var(--text-main)', 
              border: post.isLiked ? '1px solid #ffccd8' : '1px solid #ddd', 
              padding: '12px 28px', 
              borderRadius: '30px', 
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLiking ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={20} color="var(--primary-color)" fill={post.isLiked ? 'var(--primary-color)' : 'none'} />
            <span>좋아요</span>
            <span style={{ fontWeight: '700' }}>
              {post.likeCount}
            </span>
          </button>
        </div>
        
        {/* Comments Section */}
        {post.boardType !== 'NOTICE' && (
          <div style={{ marginTop: '2rem' }}>
            <h3>댓글 ({comments.length})</h3>
          
          {/* 새 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f8f9fa', padding: '1rem', borderRadius: '12px', border: '1px solid #eee' }}>
              <textarea 
                value={replyToId ? '' : newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder={replyToId ? "답글을 쓰려면 아래의 답글 창을 이용해 주세요." : "댓글을 남겨보세요. (비방, 욕설 등은 삭제될 수 있습니다)"}
                disabled={!!replyToId}
                style={{ 
                  width: '100%', 
                  minHeight: '80px', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd', 
                  backgroundColor: replyToId ? '#f0f0f0' : 'white', 
                  boxSizing: 'border-box',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                required={!replyToId}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="submit-btn" style={{ width: 'auto', minWidth: '90px', height: '40px', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold' }} disabled={!!replyToId}>
                  댓글 등록
                </button>
              </div>
            </div>
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
                    <div id={`comment-${c.id}`} key={c.id} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', marginTop: '0.8rem' }}>
                      <div style={{ 
                        padding: '12px 14px', 
                        background: 'white', 
                        borderRadius: '8px', 
                        border: '1px solid #eee',
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
                            {formatDate(c.createdAt)}
                          </div>
                        </div>

                        {/* Content or Edit Form */}
                        {isEditing ? (
                          <form onSubmit={(e) => handleCommentEditSubmit(e, c.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                            <textarea 
                              value={editingText} 
                              onChange={(e) => setEditingText(e.target.value)} 
                              style={{ 
                                width: '100%', minHeight: '60px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' 
                              }}
                              required
                              autoFocus
                              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                              onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button 
                                type="button" 
                                onClick={() => { setEditingCommentId(null); setEditingText(''); }} 
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#555', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                              >
                                취소
                              </button>
                              <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
                                수정 완료
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ fontSize: depth > 0 ? '0.9rem' : '0.95rem', color: '#222', lineHeight: '1.5' }}>
                            {depth > 0 && c.parentId && (
                              <span style={{ 
                                color: 'var(--primary-color)', 
                                fontWeight: '600', 
                                marginRight: '6px',
                                background: '#fff0f2',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                              }}>
                                @{comments.find(p => p.id === c.parentId)?.nickname}
                              </span>
                            )}
                            {c.content}
                          </div>
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
                          {token && nickname !== c.nickname && role !== 'ADMIN' && !isEditing && (
                            <button 
                              type="button" 
                              onClick={() => { setReportTargetType('COMMENT'); setReportTargetId(c.id); setIsReportModalOpen(true); }}
                              style={{ background: 'none', border: 'none', color: '#888888', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Flag size={13} color="var(--primary-color)" />
                              신고
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reply form for this specific comment */}
                      {replyToId === c.id && (
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem', marginLeft: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                          <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>
                            ↳ @{c.nickname}님에게 답글 작성
                          </div>
                          <textarea 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder="답글 내용을 입력해주세요."
                            style={{ 
                              width: '100%', minHeight: '60px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', 
                              fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' 
                            }}
                            required
                            autoFocus
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              type="button" 
                              onClick={() => { setReplyToId(null); setReplyNickname(''); setNewComment(''); }} 
                              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', color: '#666', background: 'white', cursor: 'pointer', fontWeight: '500' }}
                            >
                              취소
                            </button>
                            <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
                              답글 등록
                            </button>
                          </div>
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
        )}
      </div>

      {/* 신고 모달창 */}
      {isReportModalOpen && (
        <>
          <div 
            onClick={() => { setIsReportModalOpen(false); setCustomReportReason(''); }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(2px)' }} 
          />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '2rem', zIndex: 1001, width: '90%', maxWidth: '420px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)' }}>
              <Flag size={20} color="var(--primary-color)" /> {reportTargetType === 'POST' ? '게시글' : '댓글'} 신고하기
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              부적절하거나 커뮤니티 가이드를 위반한 {reportTargetType === 'POST' ? '게시글' : '댓글'}은 신고해 주세요. 관리자 확인 후 신속히 조치하겠습니다.
            </p>
            
            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>신고 사유 선택</label>
                <select 
                  value={reportReasonOption}
                  onChange={(e) => setReportReasonOption(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="영리목적/홍보성">영리목적/홍보성</option>
                  <option value="개인정보노출">개인정보노출</option>
                  <option value="음란성/선정성">음란성/선정성</option>
                  <option value="욕설/비방/면박">욕설/비방/면박</option>
                  <option value="도배성/게시판 부적합">도배성/게시판 부적합</option>
                  <option value="기타">기타 사유 직접 입력</option>
                </select>
              </div>

              {reportReasonOption === '기타' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>상세 사유 작성</label>
                  <textarea 
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    placeholder="신고 사유를 구체적으로 기재해 주세요 (최대 500자)"
                    maxLength={500}
                    required
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsReportModalOpen(false); setCustomReportReason(''); }}
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', color: '#555', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReport}
                  style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', fontSize: '0.9rem', background: 'var(--primary-color)', color: '#fff', cursor: submittingReport ? 'not-allowed' : 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(255, 32, 112, 0.2)' }}
                >
                  {submittingReport ? '제출 중...' : '신고하기'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
