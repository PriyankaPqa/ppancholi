/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  INotificationEntity,
} from '@libs/entities-lib/notification';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

import {
  INotificationsService,
} from './notifications.types';

const API_URL_SUFFIX = 'user-account';
const CONTROLLER = 'notifications';

export class NotificationsService extends DomainBaseService<INotificationEntity, uuid> implements INotificationsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchCurrentUserNotifications(): Promise<INotificationEntity[]> {
    return this.http.get(`${this.baseUrl}/user`, { globalHandler: false });
  }

  async updateIsRead(idList: uuid[], isRead: boolean): Promise<INotificationEntity[]> {
    return this.http.patch(`${this.baseUrl}/user`, { isRead, notificationIds: idList });
  }
}
