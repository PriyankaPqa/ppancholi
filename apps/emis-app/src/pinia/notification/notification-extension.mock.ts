import { mockNotificationEntity } from '@libs/entities-lib/notification';

export function getMockExtensionComponents() {
  const notification = mockNotificationEntity();

  return {
    getNotificationsByRecipient: jest.fn(() => [notification]),
    fetchCurrentUserNotifications: jest.fn(() => [notification]),
    updateIsRead: jest.fn(() => [notification]),
  };
}
