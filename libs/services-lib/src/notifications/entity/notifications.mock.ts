import { mockNotificationEntities } from '@libs/entities-lib/notification';
import { mockDomainBaseService } from '../../base';
import { INotificationsServiceMock } from './notifications.types';

export const mockNotificationsService = (): INotificationsServiceMock => ({
  ...mockDomainBaseService(mockNotificationEntities()),
  fetchCurrentUserNotifications: jest.fn(() => mockNotificationEntities()),
  updateIsRead: jest.fn(() => mockNotificationEntities()),
});
