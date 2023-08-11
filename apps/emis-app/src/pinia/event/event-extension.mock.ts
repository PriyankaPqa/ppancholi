import { mockOptionItemData, OptionItem, mockOptionItem } from '@libs/entities-lib/optionItem';
import { mockEventEntity, mockOtherProvinceData, mockRegionData } from '@libs/entities-lib/event';
import { ref } from 'vue';

export function getMockExtensionComponents() {
  const exceptionalTypes = [mockOptionItem(),
    { ...mockOptionItem(), name: { translation: { fr: 'nope' } }, isOther: false, id: 'AA' },
    { ...mockOptionItem(), name: { translation: { fr: 'ZZ' } }, isOther: false, isDefault: true, id: 'defaultOption' },
    { ...mockOptionItem(), name: { translation: { fr: 'BB' } }, isOther: false, id: 'BB' }];

  return {
    eventsFetched: false,
    agreementTypes: ref([]),
    eventTypes: ref([]),
    agreementTypesFetched: false,
    eventTypesFetched: false,
    getExceptionalAuthenticationTypes: jest.fn(() => exceptionalTypes),
    fetchExceptionalAuthenticationTypes: jest.fn(() => exceptionalTypes),
    getAgreementTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
    getEventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
    getEventsByStatus: jest.fn(),
    fetchAgreementTypes: jest.fn(),
    fetchEventTypes: jest.fn(() => Promise.resolve(mockOptionItemData())),
    fetchOtherProvinces: jest.fn(() => Promise.resolve(mockOtherProvinceData())),
    fetchRegions: jest.fn(() => Promise.resolve(mockRegionData())),
    updateEventSection: jest.fn(),
    deleteAgreement: jest.fn(() => Promise.resolve(mockEventEntity())),
    updateExceptionalAuthenticationType: jest.fn(() => Promise.resolve(mockEventEntity())),
    deleteRegistrationAssessment: jest.fn(() => Promise.resolve(mockEventEntity())),
    toggleSelfRegistration: jest.fn(),
    setEventStatus: jest.fn(),
    createEvent: jest.fn(() => Promise.resolve(mockEventEntity())),
    updateEvent: jest.fn(() => Promise.resolve(mockEventEntity())),
    toggleAssessmentsForL0Users: jest.fn(),
    toggleRegistrationForL0Users: jest.fn(),
    updateEventConsent: jest.fn(),
  };
}
