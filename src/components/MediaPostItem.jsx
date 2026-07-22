import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatDate } from '../utils/formatDate'
import { isVideo } from '../utils/media'
import Avatar from './Avatar'

export default function MediaPostItem({ post }) {
  const [isHovered, setIsHovered] = useState(false)

  // Use a default placeholder if no imageUrl is present
  const imageUrl = post.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'

  return (
    <Link 
      to={`/community/${post.id}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        className="media-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f1f1'
        }}
      >
        {/* 3:4 비율 이미지 영역 */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', background: '#fafafa' }}>
          {isVideo(imageUrl) ? (
            <video 
              src={`${imageUrl}#t=0.001`} 
              muted 
              playsInline
              preload="metadata"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
            />
          ) : (
            <img 
              src={imageUrl} 
              alt={post.title}
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)'
              }} 
            />
          )}

          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              color: 'var(--primary-color)',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            ♥
          </div>
        </div>
        
        {/* 메타데이터 영역 (제목 2줄 제한, 프로필 아바타 매칭) */}
        <div style={{ padding: '0.9rem' }}>
          <h4 style={{ 
            margin: '0 0 0.6rem 0', 
            fontSize: '0.9rem', 
            fontWeight: '600',
            color: '#222',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.8em' // 2줄 높이 고정으로 그리드 균일성 유지
          }}>
            {post.title}
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
              <Avatar name={post.nickname || 'slime'} imageUrl={post.profileImageUrl} size={22} />
              <span style={{ fontWeight: '600', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.nickname}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#666', fontWeight: 'bold', fontSize: '0.8rem' }}>
                <span>👁️</span>
                <span>{post.viewCount || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ff2070', fontWeight: 'bold' }}>
                <span>❤️</span>
                <span>{post.likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
