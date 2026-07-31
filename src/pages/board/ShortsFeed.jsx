import React, { useState, useEffect, useRef } from 'react';
import { boardApi } from '../../api/board';
import ShortsItem from '../../components/ShortsItem';
import { useAuthStore } from '../../store';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ShortsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const sortParam = searchParams.get('sort') || 'createdAt,desc';
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
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

  useEffect(() => {
    fetchMediaPosts();
  }, [postId, sortParam, keyword]);

  const fetchMediaPosts = async () => {
    setLoading(true);
    try {
      const data = await boardApi.getPosts('MEDIA', keyword.replace(/^#/, ''), 0, 50, sortParam);
      let fetchedPosts = data.content || [];
      
      if (postId) {
        const idNum = Number(postId);
        const existingIndex = fetchedPosts.findIndex(p => p.id === idNum);
        
        if (existingIndex !== -1) {
          const targetPost = fetchedPosts[existingIndex];
          fetchedPosts.splice(existingIndex, 1);
          fetchedPosts.unshift(targetPost);
        } else {
          try {
            const singlePost = await boardApi.getPostDetail(idNum);
            fetchedPosts.unshift(singlePost);
          } catch(e) {
            console.error('Failed to fetch specific post for shorts', e);
          }
        }
      }
      
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Failed to fetch media posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shorts-feed-container" style={{
      width: '100%',
      height: '100dvh',
      background: 'black',
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto'
    }}>

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
            <ShortsItem key={post.id} post={post} index={index} activePostId={postId} />
          ))
        )}
      </div>
    </div>
  );
}
