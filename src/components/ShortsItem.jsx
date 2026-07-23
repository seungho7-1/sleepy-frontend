import React, { useEffect, useRef, useState } from 'react';
import { boardApi } from '../api/board';
import { useAuthStore } from '../store';
import { isVideo } from '../utils/media';
import ShortsCommentModal from './ShortsCommentModal';
import Avatar from './Avatar';
import { Heart, Volume2, VolumeX } from 'lucide-react';

export default function ShortsItem({ post, index }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState('댓글');
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const { token } = useAuthStore();
  
  // Default fallback image if no URL
  const mediaUrl = post.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';

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

  const handleLike = async (e) => {
    e.stopPropagation(); // 비디오 재생 이벤트 버블링 방지
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const res = await boardApi.toggleLike(post.id, 'POST');
      setIsLiked(res);
      setLikeCount(prev => res ? prev + 1 : Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%', // 100% of the scroll container
        scrollSnapAlign: 'start',
        position: 'relative',
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={togglePlay}
    >
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
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color={isLiked ? '#ff2070' : 'white'} fill={isLiked ? '#ff2070' : 'none'} />
          </div>
          <span style={{ fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{likeCount}</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          style={{ background: 'none', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            💬
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
            🔗
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Avatar name={post.nickname} imageUrl={post.profileImageUrl} size={32} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            @{post.nickname}
          </h3>
        </div>
        
        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {post.title} - {post.content}
        </p>

        {/* Fake Commerce Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); alert('커머스 기능 준비 중!'); }}
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 32, 112, 0.4)'
          }}
        >
          🛒 연관 상품 보러가기
        </button>
      </div>

      {/* Comment Modal Overlay */}
      {showComments && (
        <ShortsCommentModal 
          postId={post.id} 
          onClose={(e) => { if(e) e.stopPropagation(); setShowComments(false); }} 
        />
      )}
    </div>
  );
}
