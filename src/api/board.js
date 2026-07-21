import api from './index';
import imageCompression from 'browser-image-compression';

export const boardApi = {
  // 게시글 목록
  getPosts: (type = 'FREE', keyword = '', page = 0, size = 20, sort = 'createdAt,desc') => 
    api.get(`/board/posts`, { params: { type, keyword, page, size, sort } }),

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

  // 파일 업로드
  uploadFile: async (file, type = 'general') => {
    let fileToUpload = file;

    // 이미지 파일인 경우에만 압축 진행
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1, // 최대 1MB
        maxWidthOrHeight: 1920, // 최대 너비/높이
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.error('Image compression failed:', error);
        // 압축 실패 시 원본 파일 사용
      }
    }

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
  toggleLike: (targetId, targetType = 'POST') => 
    targetType === 'POST' ? api.post(`/board/posts/${targetId}/like`) : api.post(`/likes/toggle`, null, { params: { targetId, targetType } }),

  // 게시글 댓글 불러오기
  getComments: (targetId, targetType = 'POST') => 
    api.get(`/board/comments`, { params: { targetId, targetType } }),

  // 댓글 생성
  createComment: (data) => 
    api.post(`/board/comments`, data),

  // 내가 쓴 게시글 목록
  getMyPosts: (type = 'TEXT') => 
    api.get(`/board/my-posts`, { params: { type } }),

  // 내가 쓴 댓글 목록
  getMyComments: () => 
    api.get(`/board/my-comments`),

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
