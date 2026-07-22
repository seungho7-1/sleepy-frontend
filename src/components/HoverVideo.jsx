import React, { useRef, useState, useEffect } from 'react';

export default function HoverVideo({ src, style, className }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef(null);

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

  const pauseVideo = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    playVideo();
  };

  const handleMouseLeave = () => {
    pauseVideo();
  };

  const handleTouchStart = () => {
    // 터치 시 재생하고 5초 뒤 자동 정지
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isPlaying) {
      playVideo();
    }
    
    timeoutRef.current = setTimeout(() => {
      pauseVideo();
    }, 5000); // 5초간 재생
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
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
      {/* Play Icon Hint (optional, shows a small icon if paused, but let's keep it clean for now) */}
      {!isPlaying && (
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.6rem',
          pointerEvents: 'none'
        }}>
          ▶
        </div>
      )}
    </div>
  );
}
