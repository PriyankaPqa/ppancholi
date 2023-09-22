import { IMultilingual } from '@libs/shared-lib/types';

import { IEntity } from '../base';

export enum NotificationType {
  General = 0,
}

export enum NotificationCategoryType {
  General = 0,
  Tasks = 1,
  Approvals = 2,
}

export enum NotificationRecipientType {
  User = 1,
  Team = 2,
  System = 3,
}

export interface INotificationEntity extends IEntity {
  notificationType: NotificationType;
  categoryType: NotificationCategoryType;
  recipientId: uuid;
  notificationRecipientType: NotificationRecipientType;
  isRead: boolean;
  category: IMultilingual;
  subject: IMultilingual;
  message?: IMultilingual;
  targetUri?: string;
  displayAfterDateTimeUtc: Date;
  expiresAfterDateTimeUtc: Date;
}

export type IdParams = uuid;
