import React from 'react';

/**
 * 외부 이미지 API(dicebear) 의존성을 없애고 렌더링을 최적화하기 위한
 * 자체 인라인 CSS 아바타 컴포넌트입니다.
 */
export default function Avatar({ name, imageUrl, size = 38, style = {} }) {
  // 이름이 없을 경우 기본값
  const displayName = name || 'User';
  // 첫 글자 추출
  const initial = displayName.charAt(0).toUpperCase();

  // 닉네임을 해시화하여 일관된 배경색 생성
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // HSL 색상 모델을 사용하여 파스텔톤 계열의 예쁜 색상 추출
  const hue = Math.abs(hash % 360);
  const bgColor = `hsl(${hue}, 70%, 85%)`;
  const textColor = `hsl(${hue}, 70%, 30%)`; // 배경색과 어울리는 진한 글씨색

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
