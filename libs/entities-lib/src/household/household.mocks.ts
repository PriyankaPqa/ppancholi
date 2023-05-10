import { mockAssessmentResponseEntity } from '../assessment-template';
import { mockCaseFileEntity } from '../case-file';
import { IEntity, mockBaseData } from '../base';
import {
  DuplicateReason,
  DuplicateStatus,
  HouseholdStatus,
  IDetailedRegistrationResponse,
  IDuplicateData,
  IHouseholdCaseFile,
  IHouseholdCombined,
  IHouseholdDuplicate,
  IHouseholdEntity,
  IHouseholdMemberMetadata,
  IHouseholdMetadata,
} from './household.types';
/* eslint-disable no-nested-ternary */

export const mockHouseholdDuplicate = (force = {}): IHouseholdDuplicate => ({
  ...mockBaseData(),
  id: '1234',
  pairDuplicateId: '2345',
  householdId: 'household-id',
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

export const mockHouseholdEntity = (force?: Partial<IHouseholdEntity>): IHouseholdEntity => ({
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  created: '2021-05-26T19:52:44.379Z',
  timestamp: '2021-05-26T19:52:44.379Z',
  status: 1,
  createdBy: '',
  lastUpdatedBy: '',
  lastAction: '',
  lastActionCorrelationId: '',
  address: {
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
  addressHistory: [
    {
      address: {
        country: 'st',
        streetAddress: 'string',
        unitSuite: 'string',
        province: 1,
        specifiedOtherProvince: 'string',
        city: 'string',
        postalCode: 'string',
        latitude: 90,
        longitude: 180,
      },
      from: '2021-05-26T19:52:44.379Z',
      to: '2021-05-26T19:52:44.379Z',
    },
  ],
  members: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  primaryBeneficiary: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  registrationNumber: 'string',
  householdStatus: HouseholdStatus.Open,
  potentialDuplicates: [mockHouseholdDuplicate()],
  ...force,
});

export const mockHouseholdMemberMetadata = (force?: Partial<IHouseholdMemberMetadata>): IHouseholdMemberMetadata => ({
  id: 'id-1',
  firstName: 'Mister',
  lastName: 'Test',
  email: 'Test@mail.com',
  alternatePhoneNumber: null,
  homePhoneNumber: null,
  mobilePhoneNumber: null,
  dateOfBirth: '2000-06-12',
  ...force,
});

export const mockHouseholdCaseFile = (force?: Partial<IHouseholdCaseFile>): IHouseholdCaseFile => ({
  eventId: '60983874-18bb-467d-b55a-94dc55818151',
  caseFileId: '11-22-334',
  caseFileNumber: '111',
  caseFileStatus: 1,
  registeredDate: '2021-02-02',
  ...force,
});

export const mockHouseholdMetadata = (force?: Partial<IHouseholdMetadata>): IHouseholdMetadata => ({
  ...mockBaseData(),
  memberMetadata: [mockHouseholdMemberMetadata()],
  ...force,
});

export const mockCombinedHousehold = (force?: Partial<IEntity>): IHouseholdCombined => ({
  entity: mockHouseholdEntity(force),
  metadata: mockHouseholdMetadata(force),
});

export const mockCombinedHouseholds = (): IHouseholdCombined[] => [
  mockCombinedHousehold({ id: '1' }),
  mockCombinedHousehold({ id: '2' }),
];

export const mockDetailedRegistrationResponse = (): IDetailedRegistrationResponse => (
  JSON.parse(JSON.stringify({
    assessmentResponses: [mockAssessmentResponseEntity({ id: '1' })],
    caseFile: mockCaseFileEntity(),
    household: mockHouseholdEntity(),
  })));

export const mockDuplicateData = (force = {}): IDuplicateData => ({
  potentialDuplicateId: '1234',
  householdId: '919a8baf-8dbb-4c3c-b3bc-78aff773455a',
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

export const mockHouseholdDuplicateFullData = (force = {}) => ({
  ...mockHouseholdDuplicate(),
  ...mockDuplicateData(),
  ...force,
});
