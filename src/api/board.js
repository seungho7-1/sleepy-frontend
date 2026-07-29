import api from './index';
import imageCompression from 'browser-image-compression';

export const boardApi = {
  // 게시글 목록
  getPosts: (type = 'FREE', keyword = '', page = 0, size = 20, sort = 'createdAt,desc') => {
    const params = { keyword, page, size, sort, type };
    return api.get(`/board/posts`, { params });
  },

  // 게시글 상세
  getPostDetail: (id) => 
    api.get(`/board/posts/${id}`),

  // 게시글 생성
  createPost: (data) => 
    api.post(`/board/posts`, data),

  // 게시글 수정
  updatePost: (id, data) => 
    api.put(`/board/posts/${id}`, data),

  // 게시글 삭제
  deletePost: (id) => 
    api.delete(`/board/posts/${id}`),

  // 파일 업로드 (이미지: 기존 서버 경유 방식, 영상: Presigned URL 직접 업로드 방식)
  uploadFile: async (file, type = 'general', onProgress = () => {}) => {
    let fileToUpload = file;

    // 이미지 파일인 경우에만 압축 진행 (기존 로직 유지)
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.error('Image compression failed:', error);
      }
    }

    // 🎬 영상 파일인 경우 → Presigned URL로 S3에 직접 업로드 (서버 부담 제로)
    if (file.type.startsWith('video/')) {
      // 1단계: 백엔드에서 Presigned URL 발급받기
      const presignedRes = await api.get('/upload/presigned-url', {
        params: {
          fileName: fileToUpload.name,
          contentType: fileToUpload.type,
          type: type,
        },
      });

      const { presignedUrl, fileUrl } = presignedRes;

      // 2단계: S3에 직접 PUT 업로드 (XMLHttpRequest로 진행률 추적)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', fileToUpload.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 업로드 실패: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('S3 업로드 중 네트워크 오류'));
        xhr.send(fileToUpload);
      });

      return { url: fileUrl };
    }

    // 📷 이미지 파일인 경우 → 기존 서버 경유 업로드
    const formData = new FormData();
    formData.append('file', fileToUpload);
    return api.post('/upload', formData, {
      params: { type },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  //조회수 증가 함수
  incrementViewCount: (id) => api.post(`/board/posts/${id}/view`),
  // 게시글 좋아요 토글
 toggleLike: (targetId, targetType = 'POST') => {
  const requestBody = { targetId, targetType }; 
  return api.post(`/likes/toggle`, requestBody); 
},
  // 게시글 댓글 불러오기
  getComments: (targetId, targetType = 'POST') => 
    api.get(`/board/comments`, { params: { targetId, targetType } }),

  // 댓글 생성
  createComment: (data) => 
    api.post(`/board/comments`, data),

  // 내가 쓴 게시글 목록
  getMyPosts: (type = 'TEXT', page = 0, size = 10) => 
    api.get(`/board/my-posts`, { params: { type, page, size } }),

  // 내가 쓴 댓글 목록
  getMyComments: (page = 0, size = 10) => 
    api.get(`/board/my-comments`, { params: { page, size } }),

  // 댓글 수정
  updateComment: (id, data) =>
    api.put(`/board/comments/${id}`, data),

  // 댓글 삭제
  deleteComment: (id) =>
    api.delete(`/board/comments/${id}`),

  // 신고 등록
  report: (data) =>
    api.post(`/reports`, data)
};
