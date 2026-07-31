import React, { useRef, useState, useEffect } from 'react';

export default function HoverVideo({ src, thumbnailUrl, style, className }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);

  // iOS Safari 등에서 첫 프레임을 썸네일로 보여주기 위한 꼼수 (#t=0.001) - 이제 thumbnailUrl이 있으면 안 써도 됨
  const videoSrc = src.includes('#t=') ? src : `${src}#t=0.001`;

  const playVideo = () => {
    setHasHovered(true);
    // If videoRef is already mounted, play it immediately.
    // If not mounted yet, the autoPlay attribute on the video tag will handle the first play.
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Auto-play prevented:', err);
      });
    }
  };

  const pauseAndResetVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // 초기화
      setIsPlaying(false);
    }
  };

  // 비디오가 마운트될 때 isPlaying 상태 동기화 및 자동 재생 보장
  const onVideoCanPlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleMouseEnter = () => {
    playVideo();
  };

  const handleMouseLeave = () => {
    pauseAndResetVideo();
  };

  const handleTouchStart = () => {
    playVideo();
  };

  const handleTouchEnd = () => {
    pauseAndResetVideo();
  };

  return (
    <div 
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* 썸네일 이미지 (영상이 아직 재생 안되었거나, thumbnailUrl이 있을 때 표시) */}
      {(!isPlaying) && (
        <img 
          src={thumbnailUrl || videoSrc} 
          alt="thumbnail"
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}

      {/* 실제 영상: 한 번이라도 hover된 적이 있을 때만 렌더링 (Lazy Loading) */}
      {hasHovered && (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          autoPlay
          onCanPlay={onVideoCanPlay}
          onPlay={() => setIsPlaying(true)}
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        />
      )}
    </div>
  );
}
