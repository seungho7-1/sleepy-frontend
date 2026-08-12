import React from 'react';

/**
 * 외부 이미지 API(dicebear) 의존성을 없애고 렌더링을 최적화하기 위한
 * 자체 인라인 CSS 아바타 컴포넌트입니다.
 */
export default function Avatar({ name, imageUrl, size = 38, style = {} }) {
  // 이름이 없을 경우 기본값 (항상 문자열로 변환)
  const displayName = String(name || 'User');
  // 첫 글자 추출
  const initial = displayName.charAt(0).toUpperCase();

  // 요청에 따라 통일된 회색 배경 및 글씨색 사용
  const bgColor = '#f0f2f5';
  const textColor = '#8b95a1';

  return (
    <div 
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: imageUrl ? 'transparent' : bgColor,
        color: imageUrl ? 'transparent' : textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.45}px`,
        fontWeight: 'bold',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
        ...style
      }}
      title={displayName}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initial
      )}
    </div>
  );
}
