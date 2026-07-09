import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function MediaPostItem({ post }) {
  const [isHovered, setIsHovered] = useState(false)

  // Use a default placeholder if no imageUrl is present
  const imageUrl = post.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'

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
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
          <img 
            src={imageUrl} 
            alt={post.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }} 
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            backdropFilter: 'blur(4px)'
          }}>
            👍 {post.likeCount} | 👁️ {post.viewCount}
          </div>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.title}
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#666' }}>
            <span style={{ fontWeight: '500', color: 'var(--primary-color)' }}>@{post.nickname}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
