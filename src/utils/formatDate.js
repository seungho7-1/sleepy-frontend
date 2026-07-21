/**
 * 날짜 포맷 유틸리티
 * - 1시간 이내: N분 전
 * - 오늘 등록: HH:mm (예: 14:30)
 * - 오늘 이전: YY.MM.DD (예: 26.07.09)
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  let date;
  if (typeof dateStr === 'object' && dateStr.toDate) {
    date = dateStr.toDate();
  } else {
    const num = Number(dateStr);
    date = new Date(isNaN(num) ? dateStr : num);
  }
  const now = new Date();
  
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (diffMins < 1) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (isToday) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } else {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  }
}
