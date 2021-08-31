import { IEntity, mockBaseEntity } from '../base';
import {
  IHouseholdCombined, IHouseholdEntity, IHouseholdMetadata, IMemberMetadata,
} from './household.types';

export const mockHouseholdEntity = (force?: Partial<IHouseholdEntity>): IHouseholdEntity => ({
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  created: '2021-05-26T19:52:44.379Z',
  timestamp: '2021-05-26T19:52:44.379Z',
  status: 1,
  eTag: 'string',
  createdBy: '',
  lastUpdatedBy: '',
  address: {
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
    observation: 'observation'
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

export const mockMemberMetadata = (force?: Partial<IMemberMetadata>): IMemberMetadata => ({
  firstName: 'Mister',
  lastName: 'Test',
  dateOfBirth: '2000-06-12',
  ...force,
});

export const mockHouseholdMetadata = (force?: Partial<IHouseholdMetadata>): IHouseholdMetadata => ({
  ...mockBaseEntity(),
  memberMetadata: [mockMemberMetadata()],
  eventIds: ['1', '2'],
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
