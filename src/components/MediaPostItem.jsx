import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatDate } from '../utils/formatDate'
import { isVideo } from '../utils/media'
import Avatar from './Avatar'
import HoverVideo from './HoverVideo'
import { Eye, Heart, MessageCircle } from 'lucide-react';

export default function MediaPostItem({ post }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Use a default placeholder if no imageUrl is present
  const rawUrl = post.imageUrl || ''
  const imageUrl = rawUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'

  return (
    <Link 
      to={`/shorts?postId=${post.id}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        className="media-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
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
          {isVideo(imageUrl, post.thumbnailUrl) ? (
            <HoverVideo 
              src={imageUrl} 
              thumbnailUrl={post.thumbnailUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          ) : imgError ? (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #ffeef5 0%, #fff0f8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem'
            }}>🫧</div>
          ) : (
            <img 
              src={imageUrl} 
              alt={post.title}
              onError={() => setImgError(true)}
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
          {/* HOT 배지 (우측 상단 겹치기) */}
          {post.boardType !== 'NOTICE' && !post.isPinned && !post.pinned && post.authorRole !== 'ROLE_ADMIN' && ((post.popularityScore !== undefined ? post.popularityScore >= 2.0 : false) || 
            (post.popularityScore === undefined && (post.viewCount >= 50 || post.likeCount >= 3 || post.commentCount >= 5))) && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'var(--primary-color)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              HOT
            </div>
          )}
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
          <h4></h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: '8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px', flex: '0 1 auto', overflow: 'hidden' }}>
              <Avatar name={post.nickname || 'slime'} imageUrl={post.profileImageUrl} size={22} />
              <span style={{ fontWeight: '600', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.nickname}</span>
            </div>
            <div className="media-stats-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#666', fontWeight: 'bold', fontSize: '0.8rem' }}>
                <Eye size={14} />
                <span>{post.viewCount || 0}</span>
              </div>
              {(
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  <MessageCircle size={14} />
                  <span>{post.commentCount}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ff2070', fontWeight: 'bold' }}>
                <Heart size={14} color="#ff2070" fill={(post.isLiked || post.liked) ? '#ff2070' : 'none'} />
                <span>{post.likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
