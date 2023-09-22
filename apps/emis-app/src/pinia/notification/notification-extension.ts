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

  async function updateIsRead(id: uuid, isRead: boolean): Promise<INotificationEntity> {
    const res = await service.updateIsRead(id, isRead);
    if (res) {
      baseComponents.set(res);
    }
    return res;
  }

  return {
    getCurrentUserNotifications,
    updateIsRead,
  };
}
