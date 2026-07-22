import React, { useRef, useState, useEffect } from 'react';

export default function HoverVideo({ src, style, className }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // iOS Safari 등에서 첫 프레임을 썸네일로 보여주기 위한 꼼수 (#t=0.001)
  const videoSrc = src.includes('#t=') ? src : `${src}#t=0.001`;

  const playVideo = () => {
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
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
