import { BaseStoreComponents } from '@libs/stores-lib/base';
import { INotificationEntity, IdParams } from '@libs/entities-lib/notification';
import { NotificationsService, INotificationsServiceMock } from '@libs/services-lib/notifications/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<INotificationEntity, IdParams>,
  service: NotificationsService | INotificationsServiceMock,
) {
  async function getCurrentUserNotifications(): Promise<INotificationEntity[]> {
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
    getCurrentUserNotifications,
    updateIsRead,
  };
}
