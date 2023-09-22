import { IEntity, mockBaseData } from '../base';

import {
  NotificationType, NotificationRecipientType, INotificationEntity, NotificationCategoryType,
} from './notification.types';

export const mockNotificationEntity = (force?: Partial<IEntity>) : INotificationEntity => ({
  ...mockBaseData(),
  notificationType: NotificationType.General,
  categoryType: NotificationCategoryType.General,
  recipientId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  notificationRecipientType: NotificationRecipientType.User,
  isRead: false,
  category: {
    translation: {
      en: 'Category', fr: 'Catégorie',
    },
  },
  subject: {
    translation: {
      en: 'Notified', fr: 'Notifié',
    },
  },
  message: null,
  targetUri: null,
  displayAfterDateTimeUtc: null,
  expiresAfterDateTimeUtc: null,
  ...force,
});

export const mockNotificationEntities = () : INotificationEntity[] => [
  mockNotificationEntity({ id: '1' }),
  mockNotificationEntity({ id: '2' }),
];
