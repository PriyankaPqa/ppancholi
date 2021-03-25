import { IStorageMock } from './storage.types';

export const mockStorageEvent = () : IStorageMock => ({
  getters: {
    eventTypes: jest.fn(),
    events: jest.fn(),
    openEvents: jest.fn(),
    eventById: jest.fn(),
  },

  actions: {
    fetchEventTypes: jest.fn(),
    fetchEvent: jest.fn(),
    fetchEvents: jest.fn(),
    fetchOtherProvinces: jest.fn(),
    fetchRegions: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    toggleSelfRegistration: jest.fn(),
  },
});
