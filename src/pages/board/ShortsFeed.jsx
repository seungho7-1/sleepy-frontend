import React, { useState, useEffect, useRef } from 'react';
import { boardApi } from '../../api/board';
import ShortsItem from '../../components/ShortsItem';
import { useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export default function ShortsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMediaPosts();
    // 숏폼 피드 접속 시 body 스크롤 방지 및 검은색 배경 설정 (키보드 올라올 때 하얀 바탕 방지)
    const originalOverflow = document.body.style.overflow;
    const originalBg = document.body.style.backgroundColor;
    const rootEl = document.getElementById('root');
    const originalRootBg = rootEl ? rootEl.style.backgroundColor : '';

    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = 'black';
    if (rootEl) rootEl.style.backgroundColor = 'black';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.backgroundColor = originalBg;
      if (rootEl) rootEl.style.backgroundColor = originalRootBg;
    };
  }, []);

  const fetchMediaPosts = async () => {
    setLoading(true);
    try {
      const data = await boardApi.getPosts('MEDIA', '', 0, 50, 'createdAt,desc');
      setPosts(data.content || []);
    } catch (err) {
      console.error('Failed to fetch media posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100dvh', // Navbar를 숨겼으므로 전체 화면 사용
      background: 'black',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '500px', // Mobile view simulation for desktop
      margin: '0 auto'
    }}>
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
          onClick={() => navigate('/gallery')}
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
          슬라임 숏폼 🎥
        </h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Feed Container */}
      <div 
        ref={feedRef}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        
        {loading && posts.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            로딩 중...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '1rem' }}>
            <p>아직 등록된 슬라임 숏폼이 없습니다.</p>
            <button 
              onClick={() => navigate('/community/create?boardType=MEDIA')}
              style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              첫 영상 올리기!
            </button>
          </div>
        ) : (
          posts.map((post, index) => (
            <ShortsItem key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
