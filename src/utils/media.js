/**
 * 파일 경로 또는 URL을 기반으로 동영상 형식 파일인지 확인합니다.
 *
 * @param {string} url 검사할 파일 경로 또는 URL
 * @returns {boolean} 동영상 파일 여부
 */
export const isVideo = (url) => {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  return (
    lowercaseUrl.includes('.mp4') ||
    lowercaseUrl.includes('.webm') ||
    lowercaseUrl.includes('.mov') ||
    lowercaseUrl.includes('.avi')
  );
};
