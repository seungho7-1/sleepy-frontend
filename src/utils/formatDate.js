/**
 * 날짜 포맷 유틸리티
 * - 오늘 등록: HH:mm (예: 14:30)
 * - 오늘 이전: YY.MM.DD (예: 26.07.09)
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } else {
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yy}.${mm}.${dd}`
  }
}
