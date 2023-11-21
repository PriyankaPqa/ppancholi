import { mockNotificationEntity } from '@libs/entities-lib/notification';

export function getMockExtensionComponents() {
  const notification = mockNotificationEntity();

  return {
    getNotificationsByRecipient: jest.fn(() => [notification]),
    getUnreadCount: jest.fn(() => 1),
    fetchCurrentUserNotifications: jest.fn(() => [notification]),
    fetchCurrentUserUnreadIds: jest.fn(() => [notification.id]),
    updateIsRead: jest.fn(() => [notification]),
  };
}
