import React, { useEffect, useRef, useState } from 'react';
import { boardApi } from '../api/board';
import { useAuthStore } from '../store';
import { isVideo } from '../utils/media';
import ShortsCommentModal from './ShortsCommentModal';
import Avatar from './Avatar';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShortsItem({ post, index, activePostId }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState('댓글');
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const { token, role, nickname } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = nickname === post.nickname;
  const isAdmin = role === 'ADMIN';
  const canEdit = isAuthor || isAdmin;

  // URL 해시 및 activePostId를 통해 댓글 모달 자동 열기
  useEffect(() => {
    if (activePostId && Number(activePostId) === post.id && window.location.hash.includes('comment')) {
      setShowComments(true);
    }
  }, [activePostId, post.id, window.location.hash]);

  // Default fallback image if no URL
  const mediaUrl = post.imageUrl ? post.imageUrl.split(',')[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // The video is in the viewport
            if (videoRef.current) {
              videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
              setIsPlaying(true);
            }
            // 뷰포트에 들어올 때 조회수 증가 API 호출
            boardApi.incrementViewCount(post.id).catch(e => console.error(e));
            
            if (!commentsLoaded) {
              boardApi.getComments(post.id).then(res => {
                setCommentCount(res.length);
                setCommentsLoaded(true);
              }).catch(console.error);
            }
          } else {
            // The video has left the viewport
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.6 } // At least 60% of the video must be visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [post.id, commentsLoaded]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation(); // 비디오 재생 이벤트 버블링 방지
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await boardApi.toggleLike(post.id, 'POST');
      const liked = res.liked !== undefined ? res.liked : res.isLiked;
      setIsLiked(liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await boardApi.deletePost(post.id);
        alert('삭제되었습니다.');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/community/create?edit=${post.id}&boardType=MEDIA`);
  };

  return (
    <div 
      className="shorts-item-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%', // 100% of the scroll container
        scrollSnapAlign: 'start',
        position: 'relative',
      }}
    >
      <style>{`
        .shorts-item-container {
          display: block;
          background: black;
        }
        .shorts-video-wrapper {
          width: 100%;
          height: 100%;
          flex: 1;
          position: relative;
          background: black;
        }
        .shorts-desktop-comments {
          display: none;
        }
        .desktop-only-action {
          display: none;
        }
        
        @media (min-width: 768px) {
          .shorts-item-container {
            display: flex !important;
            flex-direction: row !important;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            margin: 0 auto;
            padding: 0;
            gap: 0;
            background: transparent;
          }
          .shorts-video-wrapper {
            width: 100% !important;
            flex: 1 !important;
            max-width: 500px !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0;
            overflow: hidden;
            box-shadow: none;
          }
          .shorts-desktop-comments {
            display: flex !important;
            flex-direction: column;
            width: 100%;
            flex: 1 !important;
            max-width: 500px !important;
            height: 100%;
            border-radius: 0;
            overflow: hidden;
            position: relative;
          }
          .mobile-only-comment-btn {
            display: flex !important;
          }
          .desktop-only-action {
            display: flex !important;
          }
          .mobile-only-modal {
            display: none !important;
          }
        }
      `}</style>

      <div className="shorts-video-wrapper" onClick={togglePlay}>
        {/* Header / Back button */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: '1rem',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
        }}>
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/gallery'); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            ← 
          </button>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            슬라임 숏폼
          </h2>
          <div style={{ position: 'relative' }}>
            {canEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                }}
              >
                <MoreVertical size={24} />
              </button>
            )}
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'rgba(30, 30, 30, 0.9)',
                borderRadius: '8px',
                padding: '5px 0',
                minWidth: '120px',
                zIndex: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <button 
                  onClick={handleEdit}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <Edit size={16} />
                  수정
                </button>
                <button 
                  onClick={handleDelete}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    background: 'none',
                    border: 'none',
                    color: '#ff4d4d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <Trash2 size={16} />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Player */}
      {isVideo(mediaUrl) ? (
        <video 
          ref={videoRef}
          src={mediaUrl}
          loop
          muted={isMuted}
          playsInline
          preload="none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <img 
          src={mediaUrl}
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}



      {/* Right Action Bar */}
      <div style={{
        position: 'absolute',
        right: '12px',
        bottom: '80px', // Above bottom info
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10
      }}>


        <button 
          onClick={handleLike}
          disabled={isLiking}
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: isLiking ? 'default' : 'pointer', opacity: isLiking ? 0.7 : 1 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color={isLiked ? '#ff2070' : 'white'} fill={isLiked ? '#ff2070' : 'none'} />
          </div>
          <span style={{ fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{likeCount}</span>
        </button>

        <button 
          className="mobile-only-comment-btn"
          onClick={(e) => { e.stopPropagation(); setShowComments(prev => !prev); }}
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <MessageCircle size={20} color="white" />
          </div>
          <span style={{ fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{commentCount}</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(window.location.origin + `/community/${post.id}`);
            alert('링크가 복사되었습니다!');
          }}
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <Share2 size={20} color="white" />
          </div>
          <span style={{ fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>공유</span>
        </button>

        {isVideo(mediaUrl) && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
            </div>
            <span style={{ fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {isMuted ? '음소거' : '소리 켬'}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '20px 80px 20px 20px', // leave space for right action bar
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        color: 'white',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <Avatar name={post.nickname} imageUrl={post.profileImageUrl} size={32} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            @{post.nickname}
          </h3>
          {post.hashtags && post.hashtags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: '4px' }}>
              {post.hashtags.map((tag, idx) => (
                <span 
                  key={idx} 
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/gallery?search=${tag}` }}
                  style={{ color: '#ff70a0', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ 
            margin: '0 0 12px 0', 
            fontSize: '0.95rem', 
            lineHeight: '1.4', 
            display: isExpanded ? 'block' : '-webkit-box', 
            WebkitLineClamp: isExpanded ? 'unset' : 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', 
            textShadow: '0 1px 2px rgba(0,0,0,0.8)' 
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>{post.title}</strong>
            {post.content}
          </div>
          {!isExpanded && (
            <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: '600' }}>더보기</span>
          )}
        </div>
      </div>
      
      </div> {/* End of video wrapper */}

      {/* Desktop Comments Panel */}
      {showComments && (
        <div className="shorts-desktop-comments">
          <ShortsCommentModal 
            postId={post.id} 
            inline={true}
            onClose={() => setShowComments(false)}
            onUpdateCount={setCommentCount} 
          />
        </div>
      )}

      {/* Mobile Comment Modal Overlay */}
      {showComments && (
        <div className="mobile-only-modal">
          <ShortsCommentModal 
            postId={post.id} 
            onClose={(e) => { if(e) e.stopPropagation(); setShowComments(false); }} 
            onUpdateCount={setCommentCount}
          />
        </div>
      )}
    </div>
  );
}
