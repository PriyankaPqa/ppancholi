import { mockBookingRequestsService } from '@libs/services-lib/booking-requests';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { IBookingRequest, mockBookingRequest, IdParams } from '@libs/entities-lib/booking-request';
import { getExtensionComponents } from '@/pinia/booking-request/booking-request-extension';

import { Status } from '@libs/shared-lib/types';

const entityService = mockBookingRequestsService();
const baseComponents = getBaseStoreComponents<IBookingRequest, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-booking-request': {
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useBookingRequestTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useBookingRequestStore = defineStore('test-booking-request', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useBookingRequestStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useBookingRequestTestStore(bComponents);
};

describe('>>> BookingRequest Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getByCaseFile', () => {
    test('the getter returns the items that have the id passed in the argument', () => {
      const store = createTestStore();
      const booking1 = mockBookingRequest({ id: '1', caseFileId: 'case-file-1' });
      const booking2 = mockBookingRequest({ id: '2', caseFileId: 'case-file-2' });
      store.setAll([booking1, booking2]);
      const res = store.getByCaseFile('case-file-1');
      expect(res).toEqual([booking1]);
    });
    test('the getter ignores inactive items', () => {
      const store = createTestStore();
      const item1 = mockBookingRequest({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
      const item2 = mockBookingRequest({ id: '2', caseFileId: 'case-file-2', status: Status.Active });
      store.setAll([item1, item2]);
      const res = store.getByCaseFile('case-file-2');
      expect(JSON.stringify(res)).toEqual(JSON.stringify([item2]));
    });
  });

  describe('createIndividual', () => {
    it('should call createIndividual service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IBookingRequest;
      const res = {} as IBookingRequest;
      entityService.createBookingRequest = jest.fn(() => res);
      await store.createBookingRequest(payload);

      expect(entityService.createBookingRequest).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
