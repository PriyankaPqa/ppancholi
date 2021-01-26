import { IStorageMock } from './storage.types';

export const mockStorageEvent = () : IStorageMock => ({
  getters: {
    eventTypes: jest.fn(),
    events: jest.fn(),
  },

  actions: {
    fetchEventTypes: jest.fn(),
    fetchEvents: jest.fn(),
    fetchOtherProvinces: jest.fn(),
    fetchRegions: jest.fn(),
    createEvent: jest.fn(),
  },
});
