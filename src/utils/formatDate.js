/**
 * 날짜 포맷 유틸리티
 * useRelative가 true일 경우 3일 전까지는 상대 시간(방금 전, X분 전 등)으로 표시합니다.
 * 기본값(false)일 경우 전체 시간(YYYY. MM. DD. HH:mm) 형태로 표시합니다.
 */
export function formatDate(dateStr, useRelative = false) {
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
  
  if (useRelative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // 만약 미래 시간이 들어오거나 오차가 있다면 방금 전으로 처리
    if (diffMs < 0) return '방금 전';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay <= 3) return `${diffDay}일 전`;

    // 4일 이상인 경우 날짜만 표시 (YYYY. MM. DD.)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 기본 포맷 (게시물, 댓글 등에 사용되는 기존 포맷)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
