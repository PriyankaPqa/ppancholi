import { IHouseholdData } from './household.types';

export const mockHousehold = (): IHouseholdData => ({
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  created: '2021-05-26T19:52:44.379Z',
  timestamp: '2021-05-26T19:52:44.379Z',
  status: 1,
  eTag: 'string',
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
});
