import api from './index';

export const boardApi = {
  // 게시글 목록
  getPosts: (type = 'FREE', page = 0, size = 20) => 
    api.get(`/board/posts`, { params: { type, page, size } }),

  // 게시글 상세
  getPostDetail: (id) => 
    api.get(`/board/posts/${id}`),

  // 게시글 생성
  createPost: (data) => 
    api.post(`/board/posts`, data),

  // 파일 업로드
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 게시글 좋아요 토글
  toggleLike: (targetId, targetType = 'POST') => 
    api.post(`/likes/toggle`, null, { params: { targetId, targetType } }),

  // 게시글 댓글 불러오기
  getComments: (targetId, targetType = 'POST') => 
    api.get(`/board/comments`, { params: { targetId, targetType } }),

  // 댓글 생성
  createComment: (data) => 
    api.post(`/board/comments`, data)
};
