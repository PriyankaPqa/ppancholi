import { NotificationEntity } from './notification';
import { mockNotificationEntity } from './notification.mock';

const mockNotification = mockNotificationEntity();

describe('>>> Notification', () => {
  describe('>> constructor', () => {
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

    it('should instantiate display after', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.displayAfterDateTimeUtc).toEqual(mockNotification.displayAfterDateTimeUtc);
    });

    it('should instantiate expires after', () => {
      const notification = new NotificationEntity(mockNotification);
      expect(notification.expiresAfterDateTimeUtc).toEqual(mockNotification.expiresAfterDateTimeUtc);
    });
  });
});
