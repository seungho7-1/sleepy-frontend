/**
 * 날짜 포맷 유틸리티
 * useRelative가 true일 경우 3일 전까지는 상대 시간(방금 전, X분 전 등)으로 표시합니다.
 * 기본값(false)일 경우 전체 시간(YYYY. MM. DD. HH:mm) 형태로 표시합니다.
 */
export function formatDate(dateStr, formatType = 'default') {
  if (!dateStr) return '';
  let date;
  if (typeof dateStr === 'object' && dateStr.toDate) {
    date = dateStr.toDate();
  } else if (typeof dateStr === 'object' && dateStr.seconds) {
    date = new Date(dateStr.seconds * 1000);
  } else {
    const num = Number(dateStr);
    date = new Date(isNaN(num) ? dateStr : num);
  }
  
  if (formatType === true) {
    formatType = 'relative'; // fallback for old useRelative=true usages
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // 만약 미래 시간이 1시간 이상 차이난다면, 과거 타임존 버그(UTC 9시간 차이)로 생성된 데이터로 간주하고 9시간을 보정합니다.
  if (diffMs < -3600000) {
    const correctedDate = new Date(date.getTime() - 9 * 60 * 60 * 1000);
    const correctedDiffMs = now.getTime() - correctedDate.getTime();
    
    const diffSec = Math.floor(correctedDiffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay <= 3) return `${diffDay}일 전`;

    return `${correctedDate.getFullYear()}.${String(correctedDate.getMonth() + 1).padStart(2, '0')}.${String(correctedDate.getDate()).padStart(2, '0')}`;
  }

  // 약간의 오차로 인한 일반적인 미래 시간은 방금 전으로 처리
  if (diffMs < 0) return '방금 전';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (formatType === 'list') {
    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    // 24시간 이상인 경우 날짜만 표시 (YYYY.MM.DD)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  if (formatType === 'relative') {
    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay <= 3) return `${diffDay}일 전`;

    // 4일 이상인 경우 날짜만 표시 (YYYY.MM.DD)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  // 기본 포맷 (게시물 상세, 댓글 등에 사용되는 기존 포맷)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
