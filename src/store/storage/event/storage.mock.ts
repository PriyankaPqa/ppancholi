import { IStorageMock } from './storage.types';

export const mockStorageEvent = () : IStorageMock => ({
  getters: {
    eventTypes: jest.fn(),
  },

  actions: {
    fetchEventTypes: jest.fn(),
    createEvent: jest.fn(),
  },
});
