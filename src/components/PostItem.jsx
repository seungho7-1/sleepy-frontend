import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { Heart, Eye } from 'lucide-react';

export default function PostItem({ post }) {
  const navigate = useNavigate();

  const getBadgeStyle = (boardType) => {
    switch (boardType) {
      case 'NOTICE':
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
    'QNA': '질문',
    'FREE': '자유'
  }[post.boardType] || post.boardType;

  return (
    <div 
      className="post-item-container" 
      onClick={() => navigate(`/community/${post.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="post-item-left">
        {/* 뱃지 영역 */}
        <div className="post-item-badge-wrap">
          <span style={{
            ...getBadgeStyle(post.boardType),
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: '12px',
            whiteSpace: 'nowrap'
          }}>
            {badgeName}
          </span>
        </div>

        {/* 메인 텍스트 (제목) */}
        <div className="post-item-title">
          {post.title}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: post.likeCount > 0 ? '#ff2070' : 'inherit' }}>
          <Heart style={{ width: '14px', height: '14px', fill: post.likeCount > 0 ? '#ff2070' : 'none' }} />
          <span>{post.likeCount}</span>
        </div>

        <div className="meta-date">
          {formatDate(post.createdAt)}
        </div>
      </div>
    </div>
  );
}
