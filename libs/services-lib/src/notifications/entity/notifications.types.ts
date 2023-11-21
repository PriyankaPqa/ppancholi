import {
  INotificationEntity,
} from '@libs/entities-lib/notification';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IFetchParams {
  beforeDateTimeUtc?: Date | string;
  numberOfDays?: number;
  limit?: number;
}

export interface INotificationsService extends IDomainBaseService<INotificationEntity, uuid> {
  fetchCurrentUserNotifications(fetchParams: IFetchParams): Promise<INotificationEntity[]>;
  fetchCurrentUserUnreadIds(): Promise<uuid[]>;
  updateIsRead(idList: uuid[], isRead: boolean): Promise<INotificationEntity[]>;
}

export interface INotificationsServiceMock extends IDomainBaseServiceMock<INotificationEntity> {
  fetchCurrentUserNotifications: jest.Mock<INotificationEntity[]>;
  fetchCurrentUserUnreadIds: jest.Mock<uuid[]>;
  updateIsRead: jest.Mock<INotificationEntity[]>;
}
