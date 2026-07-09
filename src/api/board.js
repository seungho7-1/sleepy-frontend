import api from './index';

export const boardApi = {
  // 게시글 목록
  getPosts: (type = 'FREE', page = 0, size = 20, sort = 'createdAt,desc') => 
    api.get(`/board/posts`, { params: { type, page, size, sort } }),

  // 게시글 상세
  getPostDetail: (id) => 
    api.get(`/board/posts/${id}`),

  // 게시글 생성
  createPost: (data) => 
    api.post(`/board/posts`, data),

  // 파일 업로드
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      params: { type },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
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
    api.delete(`/board/comments/${id}`)
};
