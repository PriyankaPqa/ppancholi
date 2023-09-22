import { BaseStoreComponents } from '@libs/stores-lib/base';
import { INotificationEntity, IdParams } from '@libs/entities-lib/notification';
import { NotificationsService, INotificationsServiceMock } from '@libs/services-lib/notifications/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<INotificationEntity, IdParams>,
  service: NotificationsService | INotificationsServiceMock,
) {
  function getNotificationsByRecipient(recipientId: uuid): INotificationEntity[] {
    return baseComponents.getAll().filter((n) => n.recipientId === recipientId);
  }

  async function fetchCurrentUserNotifications(): Promise<INotificationEntity[]> {
    const res = await service.fetchCurrentUserNotifications();
    if (res) {
      baseComponents.setAll(res);
    }
    return res;
  }

  async function updateIsRead(idList: uuid[], isRead: boolean): Promise<INotificationEntity[]> {
    const res = await service.updateIsRead(idList, isRead);
    if (res) {
      baseComponents.setAll(res);
    }
    return res;
  }

  return {
    getNotificationsByRecipient,
    fetchCurrentUserNotifications,
    updateIsRead,
  };
}
