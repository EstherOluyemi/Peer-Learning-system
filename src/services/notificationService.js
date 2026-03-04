import api from './api';

const normalizeNotification = (notification) => ({
  ...notification,
  _id: notification?._id || notification?.id,
  message: notification?.message || notification?.title || '',
  read: Boolean(notification?.read),
  createdAt: notification?.createdAt || notification?.time || new Date().toISOString(),
});

const normalizeListResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return { notifications: payload.map(normalizeNotification), pagination: null };
  }

  if (Array.isArray(payload?.notifications)) {
    return {
      notifications: payload.notifications.map(normalizeNotification),
      pagination: payload.pagination || null,
    };
  }

  if (Array.isArray(payload?.items)) {
    return {
      notifications: payload.items.map(normalizeNotification),
      pagination: payload.pagination || null,
    };
  }

  return { notifications: [], pagination: null };
};

const normalizeCountResponse = (response) => {
  const payload = response?.data ?? response;

  if (typeof payload === 'number') return payload;
  if (typeof payload?.count === 'number') return payload.count;
  if (typeof payload?.unreadCount === 'number') return payload.unreadCount;
  return 0;
};

export const getNotifications = async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
  const response = await api.get('/v1/notifications', {
    params: { page, limit, unreadOnly },
  });

  return normalizeListResponse(response);
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get('/v1/notifications/unread-count');
  return normalizeCountResponse(response);
};

export const markNotificationAsRead = async (notificationId) => {
  await api.patch(`/v1/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.patch('/v1/notifications/read-all');
};

export const clearAllNotifications = async () => {
  await api.delete('/v1/notifications');
};

export const normalizeNotificationFromSocket = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  const notification = payload.notification || payload.data || payload;
  return normalizeNotification(notification);
};
