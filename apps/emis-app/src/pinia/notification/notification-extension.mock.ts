import { mockNotificationEntity } from '@libs/entities-lib/notification';

export function getMockExtensionComponents() {
  const notification = mockNotificationEntity();

  return {
    getCurrentUserNotifications: jest.fn(() => [notification]),
    updateIsRead: jest.fn(() => [notification]),
  };
}
