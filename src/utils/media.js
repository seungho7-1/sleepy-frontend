/**
 * 파일 경로 또는 URL을 기반으로 동영상 형식 파일인지 확인합니다.
 *
 * @param {string} url 검사할 파일 경로 또는 URL
 * @param {string} [thumbnailUrl] 썸네일 URL (있으면 영상 게시글로 판단)
 * @returns {boolean} 동영상 파일 여부
 */
export const isVideo = (url, thumbnailUrl) => {
  if (!url) return false;
  // 썸네일이 있으면 영상 게시글로 판단 (갤러리 업로드 시 영상만 썸네일 생성)
  if (thumbnailUrl) return true;
  const lowercaseUrl = url.toLowerCase();
  return (
    lowercaseUrl.includes('.mp4') ||
    lowercaseUrl.includes('.webm') ||
    lowercaseUrl.includes('.mov') ||
    lowercaseUrl.includes('.avi') ||
    lowercaseUrl.includes('video') ||
    lowercaseUrl.includes('compressed/')
  );
};
