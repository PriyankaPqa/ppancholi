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
  });

  describe('fetchCurrentUserNotifications', () => {
    it('should call fetchCurrentUserNotifications service and set the result in the store', async () => {
      const bComponents = {
        ...baseComponents,
        setAll: jest.fn(),
      };
      const store = createTestStore(bComponents);
      await store.fetchCurrentUserNotifications();

      expect(entityService.fetchCurrentUserNotifications).toBeCalledWith();
      expect(bComponents.setAll).toBeCalledWith(mockNotificationEntities());
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
  });
});
