import { IMultilingual } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import utils from '../utils';
import {
  NotificationType, NotificationRecipientType, INotificationEntity, NotificationCategoryType,
} from './notification.types';

export class NotificationEntity extends BaseEntity {
  notificationType: NotificationType;

  categoryType: NotificationCategoryType;

  recipientId: uuid;

  notificationRecipientType: NotificationRecipientType;

  isRead: boolean;

  category: IMultilingual;

  subject: IMultilingual;

  message?: IMultilingual;

  targetUri?: string;

  displayAfterDateTimeUtc?: Date;

  expiresAfterDateTimeUtc?: Date;

  constructor(data?: INotificationEntity) {
    if (data) {
      super(data);
      this.notificationType = data.notificationType;
      this.categoryType = data.categoryType;
      this.recipientId = data.recipientId;
      this.notificationRecipientType = data.notificationRecipientType;
      this.isRead = data.isRead;
      this.category = utils.initMultilingualAttributes(data.category);
      this.subject = utils.initMultilingualAttributes(data.subject);
      this.message = data.message ? utils.initMultilingualAttributes(data.message) : null;
      this.targetUri = data.targetUri;
      this.displayAfterDateTimeUtc = data.displayAfterDateTimeUtc;
      this.expiresAfterDateTimeUtc = data.expiresAfterDateTimeUtc;
    } else {
      super();
      this.subject = utils.initMultilingualAttributes();
      this.category = utils.initMultilingualAttributes();
    }
  }
}
