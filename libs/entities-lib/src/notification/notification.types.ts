import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity } from '../base';

type Dictionary<T> = { [key: string]: T };

export enum NotificationType {
  General = 0,
  NewTeamTask = 1,
  TaskUpdated = 2,
  TaskDue = 3,
  TaskReOpened = 4,
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
  targetEntityId?: uuid;
  targetEntityParentId?: uuid;
  displayAfterDateTimeUtc: Date;
  expiresAfterDateTimeUtc: Date;
}

export interface INotificationTargetLink {
  name?: string
  params?: Dictionary<string>
}

export interface INotificationHelperView {
  isUrgent: boolean;
  isDueToday: boolean;
  isOverdue: boolean;
  icon: string;
  targetLink: INotificationTargetLink;
}

export type IdParams = uuid;
