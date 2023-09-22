import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockNotificationEntity } from '@libs/entities-lib/notification';
import { getMockExtensionComponents } from './notification-extension.mock';

const storeId = 'notification';

export const useMockNotificationStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useNotificationStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockNotificationEntity()]),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    notificationStore: useNotificationStore(),
  };
};
