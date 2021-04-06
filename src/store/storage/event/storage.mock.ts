import { IStorageMock } from './storage.types';

export const mockStorageEvent = () : IStorageMock => ({
  getters: {
    agreementTypes: jest.fn(),
    eventTypes: jest.fn(),
    events: jest.fn(),
    openEvents: jest.fn(),
    eventById: jest.fn(),
  },

  actions: {
    fetchAgreementTypes: jest.fn(),
    fetchEventTypes: jest.fn(),
    fetchEvent: jest.fn(),
    fetchEvents: jest.fn(),
    fetchOtherProvinces: jest.fn(),
    fetchRegions: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    addCallCentre: jest.fn(),
    editCallCentre: jest.fn(),
    addAgreement: jest.fn(),
    editAgreement: jest.fn(),
    deleteAgreement: jest.fn(),
    addRegistrationLocation: jest.fn(),
    editRegistrationLocation: jest.fn(),
    toggleSelfRegistration: jest.fn(),
  },
});
