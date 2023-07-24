import { mockBaseData } from '../base';
import { DuplicateReason, DuplicateStatus, IPotentialDuplicateEntity, IDuplicateHousehold } from './potential-duplicate.types';

export const mockDuplicateHousehold = (force = {}): IDuplicateHousehold => ({
  householdId: '1234',
  primaryBeneficiaryFullName: 'John Smith',
  registrationNumber: '111222333',
  caseFiles: [{
    caseFileNumber: '000000111-000001',
    caseFileId: 'casefile-id',
    eventId: 'event-id',
    eventName: {
      translation: {
        en: 'Gatineau Floods 2021',
        fr: 'Inondations Gatineau 2021',
      },
    } }],
  homeAddress: {
    address: {
      country: 'USA',
      streetAddress: 'West str.',
      unitSuite: '100',
      province: 1,
      specifiedOtherProvince: 'string',
      city: 'New York',
      postalCode: '123456',
      latitude: 90,
      longitude: 180,
    },
    from: '2021-05-26T19:52:44.379Z',
    to: '2021-05-26T19:52:44.379Z',
    observation: 'observation',
  },
  alternatePhoneNumber: {
    countryCode: 'CA',
    e164Number: '15145454548',
    extension: '1234',
    number: '(438) 888-8888',
  },
  homePhoneNumber: {
    countryCode: 'CA',
    e164Number: '15145454548',
    number: '(514) 545-4548',
  },
  mobilePhoneNumber: {
    countryCode: 'CA',
    e164Number: '15145454548',
    number: '(866) 866-6666',
  },
  ...force,
});

export const mockPotentialDuplicateEntity = (force = {}): IPotentialDuplicateEntity => ({
  ...mockBaseData(),
  id: '1234',
  householdIds: ['household-1-id', 'household-2-id'],
  duplicateReasons: [DuplicateReason.FullName, DuplicateReason.HomeAddress],
  duplicateStatus: DuplicateStatus.Potential,
  memberFirstName: 'Joe',
  memberLastName: 'Smith',
  duplicateStatusHistory: [{
    userInformation: {
      userId: 'test-user-id-123456',
      userName: 'Mock user name',
      roleName: {
        translation: {
          en: 'System Admin',
          fr: 'System Admin in french',
        },
      },
    },
    dateOfAction: '2023-01-18T15:51:28.0626034Z',
    duplicateStatus: DuplicateStatus.Potential,
    rationale: 'Some reason to mark as duplicate' }],
    ...force,
});

export const mockHouseholdDuplicateFullData = (force = {}) => ({
  ...mockPotentialDuplicateEntity(),
  duplicateHousehold: mockDuplicateHousehold(),
  ...force,
});
