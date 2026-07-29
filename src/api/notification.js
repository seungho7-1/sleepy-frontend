import api from './index';

export const notificationApi = {
  // 알림 목록 조회
  getNotifications: (page = 0, size = 10) => 
    api.get(`/notifications`, { params: { page, size } }),

  // 안 읽은 알림 개수 조회
  getUnreadCount: () => 
    api.get(`/notifications/unread/count`),

  // 알림 읽음 처리
  markAsRead: (id) => 
    api.put(`/notifications/${id}/read`),

  // 모든 알림 읽음 처리
  markAllAsRead: () => 
    api.put(`/notifications/read-all`),
};
