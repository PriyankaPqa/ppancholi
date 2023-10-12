import { NotificationEntity } from './notification';
import { mockNotificationEntity } from './notification.mock';
import utils from '../utils';
import { NotificationCategoryType, NotificationRecipientType, NotificationType } from './notification.types';

const mockNotification = mockNotificationEntity();

describe('>>> Notification', () => {
  describe('>> constructor (from entity)', () => {
    it('should instantiate id', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.id).toBe(mockNotification.id);
    });

    it('should instantiate notification type', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.notificationType).toEqual(mockNotification.notificationType);
    });

    it('should instantiate category type', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.categoryType).toBe(mockNotification.categoryType);
    });

    it('should instantiate recipient id', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.recipientId).toBe(mockNotification.recipientId);
    });

    it('should instantiate notification recipient type', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.notificationRecipientType).toBe(mockNotification.notificationRecipientType);
    });

    it('should instantiate isRead', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.isRead).toEqual(mockNotification.isRead);
    });

    it('should instantiate category', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.category).toEqual(mockNotification.category);
    });

    it('should instantiate subject', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.subject).toEqual(mockNotification.subject);
    });

    it('should instantiate message', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.message).toEqual(mockNotification.message);
    });

    it('should instantiate target uri', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.targetUri).toEqual(mockNotification.targetUri);
    });

    it('should instantiate target entity id', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.targetEntityId).toEqual(mockNotification.targetEntityId);
    });

    it('should instantiate target entity parent id', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.targetEntityParentId).toEqual(mockNotification.targetEntityParentId);
    });

    it('should instantiate display after', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.displayAfterDateTimeUtc).toEqual(mockNotification.displayAfterDateTimeUtc);
    });

    it('should instantiate expires after', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.expiresAfterDateTimeUtc).toEqual(mockNotification.expiresAfterDateTimeUtc);
    });
  });
  describe('>> constructor (no parameters)', () => {
    const emptyMultilingual = utils.initMultilingualAttributes();

    it('should instantiate subject', () => {
      const notification = new NotificationEntity();
      expect(notification.subject).toEqual(emptyMultilingual);
    });

    it('should instantiate category', () => {
      const notification = new NotificationEntity();
      expect(notification.category).toEqual(emptyMultilingual);
    });

    it('should have general category type', () => {
      const notification = new NotificationEntity();
      expect(notification.categoryType).toEqual(NotificationCategoryType.General);
    });

    it('should have general notification type', () => {
      const notification = new NotificationEntity();
      expect(notification.notificationType).toEqual(NotificationType.General);
    });

    it('should have user recipient type', () => {
      const notification = new NotificationEntity();
      expect(notification.notificationRecipientType).toEqual(NotificationRecipientType.User);
    });
  });
});
