import { Ref, ref } from 'vue';
import { BaseStoreComponents } from '@libs/stores-lib/base';
import { INotificationEntity, IdParams } from '@libs/entities-lib/notification';
import { NotificationsService, INotificationsServiceMock, IFetchParams } from '@libs/services-lib/notifications/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<INotificationEntity, IdParams>,
  service: NotificationsService | INotificationsServiceMock,
) {
  const unreadIds = ref([]) as Ref<uuid[]>;

  function trackIsRead(notification: INotificationEntity) {
    if (!notification.isRead && unreadIds.value.indexOf(notification.id) < 0) {
      unreadIds.value.push(notification.id);
    }

    if (notification.isRead) {
      const idx = unreadIds.value.indexOf(notification.id);
      if (idx > -1) {
        unreadIds.value.splice(idx, 1);
      }
    }
  }

  function setAll(items: INotificationEntity[]) {
    items.forEach((item) => trackIsRead(item));
    baseComponents.setAll(items);
  }

  function setItemFromOutsideNotification(entity: INotificationEntity, initiatedByCurrentUser: boolean) {
    trackIsRead(entity);
    baseComponents.setItemFromOutsideNotification(entity, initiatedByCurrentUser);
  }

  function getNotificationsByRecipient(recipientId: uuid): INotificationEntity[] {
    return baseComponents
      .getAll()
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => (a.created > b.created ? -1 : 1));
  }

  function getUnreadCount(): number {
    return unreadIds.value.length;
  }

  async function fetchCurrentUserNotifications(fetchParams?: IFetchParams): Promise<INotificationEntity[]> {
    const res = await service.fetchCurrentUserNotifications(fetchParams);
    if (res) {
      setAll(res);
    }
    return res;
  }

  async function fetchCurrentUserUnreadIds(): Promise<uuid[]> {
    const res = await service.fetchCurrentUserUnreadIds();
    if (res) {
      unreadIds.value = res;
    }
    return res;
  }

  async function updateIsRead(idList: uuid[], isRead: boolean): Promise<INotificationEntity[]> {
    // when a notification is marked as read, also mark any duplicates (same associated entity)
    let effectiveIdList = idList;
    if (isRead) {
      const allNotifications = baseComponents.getAll();
      const inputTargets = allNotifications.filter((e) => e.targetEntityId && idList.find((i) => e.id === i)).map((e) => e.targetEntityId);
      const duplicates = allNotifications.filter((e) => inputTargets.find((i) => i === e.targetEntityId)).map((e) => e.id);
      effectiveIdList = [...new Set([...idList, ...duplicates])];
    }
    const res = await service.updateIsRead(effectiveIdList, isRead);
    if (res) {
      setAll(res);
    }
    return res;
  }

  return {
    getNotificationsByRecipient,
    getUnreadCount,
    fetchCurrentUserNotifications,
    fetchCurrentUserUnreadIds,
    updateIsRead,
    setItemFromOutsideNotification,
  };
}
