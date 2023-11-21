import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/notification/notification-extension';

import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { mockNotificationsService } from '@libs/services-lib/notifications/entity';
import { IdParams, INotificationEntity, mockNotificationEntities, mockNotificationEntity } from '@libs/entities-lib/notification';

const entityService = mockNotificationsService();
const baseComponents = getBaseStoreComponents<INotificationEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useNotificationTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useStore = defineStore('test-notification', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useNotificationTestStore(bComponents);
  store.items.splice(0, 100); // clear any existing state
  return store;
};

describe('>>> Notification Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationsByRecipient', () => {
    it('should return notifications filtered by recipient', () => {
      const notification = mockNotificationEntity();
      const bComponents = {
        ...baseComponents,
        getAll: jest.fn(() => [notification]),
      };
      const store = createTestStore(bComponents);
      const result = store.getNotificationsByRecipient(notification.recipientId);
      expect(result).toHaveLength(1);
    });

    it('should filter out notifications with non-matching recipient', () => {
      const notification = mockNotificationEntity();
      const bComponents = {
        ...baseComponents,
        getAll: jest.fn(() => [notification]),
      };
      const store = createTestStore(bComponents);
      const result = store.getNotificationsByRecipient('other');
      expect(result).toHaveLength(0);
    });

    it('should return notifications sorted by descending creation date', () => {
      const nA = mockNotificationEntity({ created: '2023-10-01 00:00:00' });
      const nB = mockNotificationEntity({ created: '2023-10-02 00:00:00' });
      const nC = mockNotificationEntity({ created: '2023-10-03 00:00:00' });
      const nD = mockNotificationEntity({ created: '2023-10-04 00:00:00' });
      const bComponents = {
        ...baseComponents,
        getAll: jest.fn(() => [nB, nD, nA, nC]),
      };
      const store = createTestStore(bComponents);
      const result = store.getNotificationsByRecipient(nA.recipientId);
      expect(result).toEqual([nD, nC, nB, nA]);
    });
  });

  describe('setItemFromOutsideNotification', () => {
    it('calls base component', () => {
      const bComponents = {
        ...baseComponents,
        setItemFromOutsideNotification: jest.fn(),
      };
      const store = createTestStore(bComponents);
      const notification = mockNotificationEntity();
      store.setItemFromOutsideNotification(notification, true);
      expect(bComponents.setItemFromOutsideNotification).toHaveBeenCalledWith(notification, true);
    });
    it('should track unread notifications', () => {
      const store = createTestStore(baseComponents);
      const notification = mockNotificationEntity();
      expect(store.getUnreadCount()).toEqual(0);
      store.setItemFromOutsideNotification(notification, true);
      expect(store.getUnreadCount()).toEqual(1);
      notification.isRead = true;
      store.setItemFromOutsideNotification(notification, true);
      expect(store.getUnreadCount()).toEqual(0);
    });
  });

  describe('getUnreadCount', () => {
    it('returns zero initially', () => {
      const store = createTestStore(baseComponents);
      expect(store.getUnreadCount()).toEqual(0);
    });
  });

  describe('fetchCurrentUserNotifications', () => {
    it('should call fetchCurrentUserNotifications service and set the result in the store', async () => {
      const bComponents = {
        ...baseComponents,
        setAll: jest.fn(),
      };
      const store = createTestStore(bComponents);
      await store.fetchCurrentUserNotifications({ limit: 1 });

      expect(entityService.fetchCurrentUserNotifications).toBeCalledWith({ limit: 1 });
      expect(bComponents.setAll).toBeCalledWith(mockNotificationEntities());
    });
    it('should track unread notifications', async () => {
      const store = createTestStore(baseComponents);
      await store.fetchCurrentUserNotifications({});
      expect(store.getUnreadCount()).toEqual(2);
    });
  });

  describe('updateIsRead', () => {
    it('should call updateIsRead service', async () => {
      const notificationId = '1';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };
      const store = createTestStore(bComponents);
      await store.updateIsRead([notificationId], true);

      expect(entityService.updateIsRead).toBeCalledWith([notificationId], true);
    });
    it('should result in update of unread count', async () => {
      const mockNotification = mockNotificationEntities()[0];
      mockNotification.isRead = true;
      entityService.updateIsRead = jest.fn(() => [mockNotification]);
      const store = createTestStore(baseComponents);
      expect(store.getUnreadCount()).toEqual(0);
      await store.fetchCurrentUserUnreadIds();
      expect(store.getUnreadCount()).toEqual(2);
      await store.updateIsRead([mockNotification.id], true);
      expect(store.getUnreadCount()).toEqual(1);
    });
    it('should include duplicate notifications in the service call', async () => {
      const store = createTestStore();
      const mockNotification1 = mockNotificationEntity({ id: 'mn1', targetEntityId: 'te' });
      const mockNotification2 = mockNotificationEntity({ id: 'mn2', targetEntityId: 'te' });
      store.setAll([mockNotification1, mockNotification2]);

      await store.updateIsRead([mockNotification1.id], true);

      expect(entityService.updateIsRead).toBeCalledWith([mockNotification1.id, mockNotification2.id], true);
    });
    it('should eliminate duplicate ids from the service call', async () => {
      const store = createTestStore();
      const mockNotification1 = mockNotificationEntity({ id: 'mn1', targetEntityId: 'te' });
      const mockNotification2 = mockNotificationEntity({ id: 'mn2', targetEntityId: 'te' });
      store.setAll([mockNotification1, mockNotification2]);

      await store.updateIsRead([mockNotification1.id, mockNotification2.id, mockNotification1.id], true);

      expect(entityService.updateIsRead).toBeCalledWith([mockNotification1.id, mockNotification2.id], true);
    });
  });

  describe('fetchCurrentUserUnreadIds', () => {
    it('should call fetchCurrentUserUnreadIds service', async () => {
      const store = createTestStore(baseComponents);
      await store.fetchCurrentUserUnreadIds();
      expect(entityService.fetchCurrentUserUnreadIds).toBeCalled();
    });
    it('should track result ids in the store', async () => {
      const store = createTestStore(baseComponents);
      expect(store.getUnreadCount()).toEqual(0);
      await store.fetchCurrentUserUnreadIds();
      // mock service returns ids of mockNotificationEntities() (2 items)
      expect(store.getUnreadCount()).toEqual(2);
    });
  });
});
