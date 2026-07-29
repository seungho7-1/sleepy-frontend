/**
 * 날짜 포맷 유틸리티
 * 모든 시간을 일관된 형태로 표시 (YYYY. MM. DD. HH:mm)
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
  
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
