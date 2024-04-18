import { mockAssessmentResponseEntity } from '../assessment-template';
import { mockCaseFileEntity } from '../case-file';
import {
  HouseholdStatus,
  IDetailedRegistrationResponse,
  IHouseholdCaseFile,
  IHouseholdCombined,
  IHouseholdEntity,
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
  householdStatus: HouseholdStatus.Open,
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

export const mockCombinedHousehold = (force?: Partial<IHouseholdEntity>): IHouseholdCombined => ({
  entity: mockHouseholdEntity(force),
  metadata: null,
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
