import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import HoverVideo from '../HoverVideo';
import Avatar from '../Avatar';

export default function HeroCarousel({ latestPosts }) {
  const feedScrollRef = useRef(null);

  const scrollFeed = (direction) => {
    const el = feedScrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="latest-posts-section" style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111', margin: 0 }}>
            실시간 슬라임 자랑 피드
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
            유저들이 올린 매력 만점 슬라임 플레이 피드
          </p>
        </div>
        <Link 
          to="/gallery" 
          style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' }}
        >
          더보기 &gt;
        </Link>
      </div>

      {latestPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-sub)' }}>
          아직 등록된 자랑 영상/사진이 없습니다.
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* 좌측 스크롤 화살표 (데스크톱 전용) */}
          <button
            onClick={() => scrollFeed('left')}
            aria-label="이전"
            style={{
              position: 'absolute', top: '50%', left: '-16px', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: 'white', border: '1px solid #ffeef2',
              boxShadow: '0 4px 10px rgba(255, 32, 112, 0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >‹</button>

          {/* 단일행 가로 스크롤 캐러셀 */}
          <div
            ref={feedScrollRef}
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '4px 0',
            }}
          >
            {latestPosts.map(post => (
                <Link
                  to={`/shorts?postId=${post.id}`}
                  key={post.id}
                style={{
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  color: 'inherit',
                  flex: '0 0 135px',
                  display: 'block',
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '135px',
                  aspectRatio: '3 / 4',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #ffeef2',
                  backgroundColor: '#fafafa',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  {post.imageUrl ? (
                    post.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                      <HoverVideo src={post.imageUrl} thumbnailUrl={post.thumbnailUrl} />
                    ) : (
                      <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    )
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ffe5ee, #ffccd9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🫧</span>
                    </div>
                  )}

                  {/* 이미지 내 하단 오버레이 (아바타, 닉네임, 좋아요 표시) */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                    padding: '12px 10px 8px 10px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Avatar name={post.nickname} size={18} style={{ border: '1px solid #ffd6e0' }} />
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '600', 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)', 
                        maxWidth: '65px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {post.nickname}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ color: '#ff5b94', textShadow: '0 1px 2px rgba(0,0,0,0.4)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span>♥</span>
                        <span style={{ fontSize: '0.7rem', color: 'white' }}>{post.likeCount}</span>
                      </div>
                      <div style={{ color: '#eaeaea', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem' }}>👁</span>
                        <span style={{ fontSize: '0.65rem', color: 'white' }}>{post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 우측 스크롤 화살표 (데스크톱 전용) */}
          <button
            onClick={() => scrollFeed('right')}
            aria-label="다음"
            style={{
              position: 'absolute', top: '50%', right: '-16px', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: 'white', border: '1px solid #ffeef2',
              boxShadow: '0 4px 10px rgba(255, 32, 112, 0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#ff2070', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >›</button>
        </div>
      )}
    </div>
  );
}
