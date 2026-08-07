import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { Heart, Eye, MessageCircle } from 'lucide-react';

export default function PostItem({ post, isNoticeTab = false }) {
  const navigate = useNavigate();

  const isPinned = Boolean(post.isPinned || post.pinned);
  // 공지사항이거나 핀된 글이면서 공지사항 탭이 아닐 때 → 빨간 고정 스타일 적용
  const isPinnedNotice = (post.boardType === 'NOTICE' || isPinned) && !isNoticeTab;

  const getBadgeStyle = (boardType) => {
    switch (boardType) {
      case 'NOTICE':
      case 'ALL':
        return { background: 'rgba(255, 107, 139, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(255, 107, 139, 0.2)' };
      case 'QNA':
        return { background: 'rgba(74, 144, 226, 0.1)', color: '#4a90e2', border: '1px solid rgba(74, 144, 226, 0.2)' };
      case 'FREE':
        return { background: 'rgba(155, 155, 155, 0.1)', color: '#666', border: '1px solid rgba(155, 155, 155, 0.2)' };
      default:
        return { background: '#f5f5f5', color: '#888', border: '1px solid #eee' };
    }
  };

  const badgeName = {
    'NOTICE': '공지',
    'ALL': '공지',
    'QNA': '질문',
    'FREE': '잡담',
    'REVIEW': '후기',
    'INFO': '정보'
  }[post.boardType] || post.boardType;

  return (
    <div
      className={`post-item-container ${isPinnedNotice ? 'notice-post' : ''}`}
      onClick={() => navigate(`/community/${post.id}`)}
      style={{
        cursor: 'pointer',
        ...(isPinnedNotice ? { backgroundColor: '#fff0f5', borderLeft: '4px solid var(--primary-color)' } : {})
      }}
    >
      <div className="post-item-left">
        {/* 카테고리 배지 */}
        <div className="post-item-badge-wrap" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: '46px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <span style={{
              ...getBadgeStyle(isPinnedNotice ? 'NOTICE' : post.boardType),
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 0',
              width: '100%',
              textAlign: 'center',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {isPinnedNotice ? '공지' : badgeName}
            </span>
          </div>
        </div>

        {/* 제목 + HOT 배지 */}
        <div className="post-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </span>
          {!isPinnedNotice && post.boardType !== 'NOTICE' && !post.isPinned && !post.pinned && post.authorRole !== 'ROLE_ADMIN' &&
            ((post.popularityScore !== undefined ? post.popularityScore >= 2.0 : false) ||
              (post.popularityScore === undefined && (post.viewCount >= 50 || post.likeCount >= 3 || post.commentCount >= 5))) && (
            <span style={{
              background: 'var(--primary-color)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '3px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}>
              HOT
            </span>
          )}
        </div>
      </div>

      {/* 우측 메타 정보 */}
      <div className="post-item-meta">
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500', color: 'var(--text-main)', maxWidth: '90px' }}>
          {post.nickname}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Eye style={{ width: '14px', height: '14px' }} />
          <span>{post.viewCount}</span>
        </div>

        {/* 댓글 아이콘: 공지사항(isPinnedNotice)에는 표시하지 않음 */}
        {!isPinnedNotice && post.boardType !== 'NOTICE' && post.commentCount !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: post.commentCount > 0 ? 'var(--primary-color)' : 'inherit' }}>
            <MessageCircle style={{ width: '14px', height: '14px' }} />
            <span>{post.commentCount}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: (post.isLiked || post.liked) ? '#ff2070' : 'inherit' }}>
          <Heart size={14} color="#ff2070" fill={(post.isLiked || post.liked) ? '#ff2070' : 'none'} />
          <span>{post.likeCount}</span>
        </div>

        <div className="meta-date">
          {formatDate(post.createdAt, 'list')}
        </div>
      </div>
    </div>
  );
}
