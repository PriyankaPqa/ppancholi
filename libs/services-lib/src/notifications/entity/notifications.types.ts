import {
  INotificationEntity,
} from '@libs/entities-lib/notification';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface INotificationsService extends IDomainBaseService<INotificationEntity, uuid> {
  fetchCurrentUserNotifications(): Promise<INotificationEntity[]>;
  updateIsRead(id: uuid, isRead: boolean): Promise<INotificationEntity>;
}

export interface INotificationsServiceMock extends IDomainBaseServiceMock<INotificationEntity> {
  fetchCurrentUserNotifications: jest.Mock<INotificationEntity[]>;
  updateIsRead: jest.Mock<INotificationEntity>;
}
