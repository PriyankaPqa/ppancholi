import { IEntity, mockBaseData } from '../base';
import { mockRegistrationLocations } from '../registration-event/registrationEvent.mock';
import {
  IHouseholdCombined, IHouseholdEntity, IHouseholdMetadata, IHouseholdMemberMetadata,
  IHouseholdCaseFile,
} from './household.types';
/* eslint-disable no-nested-ternary */

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
  eventName: { translation: { en: 'my event 1', fr: ' my event fr' } },
  caseFileId: '11-22-334',
  caseFileNumber: '111',
  caseFileStatus: 1,
  registeredDate: '2021-02-02',
  registrationLocations: mockRegistrationLocations(),
  ...force,
});

export const mockHouseholdMetadata = (force?: Partial<IHouseholdMetadata>): IHouseholdMetadata => ({
  ...mockBaseData(),
  memberMetadata: [mockHouseholdMemberMetadata()],
  eventIds: ['1', '2'],
  caseFiles: [mockHouseholdCaseFile()],
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
