import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockBookingRequests } from '@libs/entities-lib/booking-request';
import { getExtensionComponents } from '@/pinia/booking-request/booking-request-extension.mock';

const storeId = 'booking-request';

export const useMockBookingRequestStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useBookingRequestStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockBookingRequests()),
    ...getExtensionComponents(),
  }));

  return {
    pinia: p,
    bookingRequestStore: useBookingRequestStore(),
  };
};
