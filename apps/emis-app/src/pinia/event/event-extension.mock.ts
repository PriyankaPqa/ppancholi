import { mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { mockEventEntity, mockOtherProvinceData, mockRegionData } from '@libs/entities-lib/event';
import { ref } from 'vue';

export function getMockExtensionComponents() {
  return {
    eventsFetched: false,
    agreementTypes: ref([]),
    eventTypes: ref([]),
    agreementTypesFetched: false,
    eventTypesFetched: false,
    getAgreementTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
    getEventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
    getEventsByStatus: jest.fn(),
    fetchAgreementTypes: jest.fn(),
    fetchEventTypes: jest.fn(() => Promise.resolve(mockOptionItemData())),
    fetchOtherProvinces: jest.fn(() => Promise.resolve(mockOtherProvinceData())),
    fetchRegions: jest.fn(() => Promise.resolve(mockRegionData())),
    updateEventSection: jest.fn(),
    deleteAgreement: jest.fn(),
    deleteRegistrationAssessment: jest.fn(() => Promise.resolve(mockEventEntity())),
    toggleSelfRegistration: jest.fn(),
    setEventStatus: jest.fn(),
    createEvent: jest.fn(() => Promise.resolve(mockEventEntity())),
    updateEvent: jest.fn(() => Promise.resolve(mockEventEntity())),
  };
}
