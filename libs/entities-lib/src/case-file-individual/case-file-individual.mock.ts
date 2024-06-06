import { ECurrentAddressTypes } from '../value-objects/current-address';
import { mockAddress } from '../value-objects/address';
import { mockBaseData } from '../base';
import { ICaseFileIndividualEntity, ReceivingAssistanceDetail, TemporaryAddress } from './case-file-individual.types';

export const mockReceivingAssistanceDetails = (force?: Partial<ReceivingAssistanceDetail>) : ReceivingAssistanceDetail => ({
  ...mockBaseData(),
  receivingAssistance: true,
  detailDate: '2023-05-01T11:11:11.000Z',
  rationale: null,
  ...force,
});

export const mockCampgroundData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.Campground,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
  checkIn: '2023-05-01T00:00:00.000Z',
  checkOut: '2023-05-31T00:00:00.000Z',
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockHotelMotelData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.HotelMotel,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockMedicalFacilityCurrentAddressData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.MedicalFacility,
  address: mockAddress(),
  placeName: 'test',
  placeNumber: '',
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockFriendsFamilyData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.FriendsFamily,
  address: mockAddress(),
  placeName: null,
  placeNumber: null,
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockUnknownData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.Unknown,
  address: mockAddress(),
  placeName: null,
  placeNumber: null,
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockRemainingHomeData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.RemainingInHome,
  address: mockAddress(),
  placeName: null,
  placeNumber: null,
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockOtherData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.Other,
  placeName: 'Other address',
  address: mockAddress(),
  placeNumber: null,
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
  shelterLocationId: null,
});

export const mockShelterData = (): TemporaryAddress => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.Shelter,
  address: mockAddress(),
  shelterLocationId: 'shelterid',
  placeName: null,
  placeNumber: null,
  checkIn: null,
  checkOut: null,
  crcProvided: null,
  from: '2023-05-01T11:11:11.000Z',
  to: null,
});

export const mockTemporaryAddress = (force?: Partial<TemporaryAddress>) : TemporaryAddress => ({
  ...mockHotelMotelData(),
  ...force,
});

export const mockCaseFileIndividualEntity = (force? : Partial<ICaseFileIndividualEntity>) : ICaseFileIndividualEntity => ({
  ...mockBaseData(),
  caseFileId: '38106287-9046-47b9-8981-76ede656d305',
  personId: 'mock-person-id',
  receivingAssistanceDetails: [
    mockReceivingAssistanceDetails(),
  ],
  receivingAssistance: true,
  currentAddress: mockTemporaryAddress({ from: '2023-05-05T11:11:11.000Z' }),
  temporaryAddressHistory: [
    mockTemporaryAddress({ from: '2023-05-05T11:11:11.000Z' }),
    { ...mockOtherData(), from: '2023-05-01T11:11:11.000Z', to: '2023-05-05T11:11:11.000Z' },
  ],
  ...force,
});

export const mockCaseFileIndividualEntities = () : ICaseFileIndividualEntity[] => [
  mockCaseFileIndividualEntity({ id: '1', personId: 'pid-1', caseFileId: 'cfid-1' }),
  mockCaseFileIndividualEntity({ id: '2', personId: 'pid-2', caseFileId: 'cfid-2' }),
];
