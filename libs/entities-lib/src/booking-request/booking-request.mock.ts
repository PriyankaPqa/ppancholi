import { ECurrentAddressTypes } from '../value-objects/current-address';
import { mockAddress } from '../value-objects/address';
import { mockBaseData } from '../base';
import { BookingRequestState, IBookingRequest, RoomOption, RoomType } from './booking-request.types';

export const mockBookingRequest = (force?: Partial<IBookingRequest>) : IBookingRequest => ({
  ...mockBaseData(),
  addressType: ECurrentAddressTypes.HotelMotel,
  address: mockAddress(),
  checkIn: '2023-05-01T00:00:00.000Z',
  checkOut: '2023-05-31T00:00:00.000Z',
  crcProvided: true,
  caseFileId: 'cf-id',
  householdId: 'hh-id',
  notes: 'some notes',
  numberOfAdults: 3,
  numberOfChildren: 2,
  numberOfRooms: 2,
  roomOptions: [RoomOption.BabyBed, RoomOption.Elevator],
  roomTypes: [RoomType.TwoBeds],
  state: BookingRequestState.Rejected,
  ...force,
});

export const mockBookingRequests = (force?: Partial<IBookingRequest>) : IBookingRequest[] => [
  mockBookingRequest({ id: '1-rejected', householdId: 'hh-1', caseFileId: 'cfid-1', state: BookingRequestState.Rejected, ...force }),
  mockBookingRequest({ id: '2-approved', householdId: 'hh-2', caseFileId: 'cfid-2', state: BookingRequestState.Approved, ...force }),
  mockBookingRequest({ id: '3-pending', householdId: 'hh-1', caseFileId: 'cfid-3', state: BookingRequestState.Pending, ...force }),
];
