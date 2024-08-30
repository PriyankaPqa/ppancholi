import { mockAppointment, DayOfWeek, mockStaffMemberAvailability, mockServiceOption } from '@libs/entities-lib/appointment';
import helpers from '@/ui/helpers/helpers';

const today = helpers.getLocalStringDate(new Date(), 'local');

export const STAFF_MEMBER_IDS = ['8db578a2-6627-4597-9ae5-94a20c85c506',
  '87eefd29-b558-4bd4-b706-b209e97d564b', 'f6881215-bf50-45c9-a154-6d48d7d89afb', '8f05945f-0093-447f-80b2-cee1b0826678'];

export const APPOINTMENTS = [
  mockAppointment({
    startDate: `${today}T14:00:00.000Z`,
    endDate: `${today}T15:00:00.000Z`,
    attendeeId: '0952b52b-8b9a-48ce-b18e-b471c91faa35',
    staffMemberId: STAFF_MEMBER_IDS[0],
  }),
  mockAppointment({
    startDate: `${today}T17:00:00.000Z`,
    endDate: `${today}T18:00:00.000Z`,
    attendeeId: '8ee976c4-680f-40c6-9772-79326d16573f',
    staffMemberId: STAFF_MEMBER_IDS[0],
  }),
  mockAppointment({
    startDate: `${today}T15:00:00.000Z`,
    endDate: `${today}T15:30:00.000Z`,
    attendeeId: '0952b52b-8b9a-48ce-b18e-b471c91faa35',
    staffMemberId: STAFF_MEMBER_IDS[1],
  }),
  mockAppointment({
    startDate: `${today}T15:00:00.000Z`,
    endDate: `${today}T16:00:00.000Z`,
    attendeeId: '27ee33b9-1328-4523-8361-a699828f1de6',
    staffMemberId: STAFF_MEMBER_IDS[3],
  }),
  mockAppointment({
    startDate: '2024-06-27T15:00:00.000Z',
    endDate: '2024-06-27T16:00:00.000Z',
    attendeeId: '27ee33b9-1328-4523-8361-a699828f1de6',
    staffMemberId: STAFF_MEMBER_IDS[3],
  }),
];

export const APPOINTMENT_PROGRAM_TIMEZONE = 'America/Toronto';// 'Europe/London';// 'America/Halifax'; // TODO: make timezones enum

export const DEFAULT_SCHEDULE = [
  { day: DayOfWeek.Monday, timeSlots: [{ start: '03:00', end: '07:00' }] },
  { day: DayOfWeek.Tuesday, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  // { day: DayOfWeek.Wednesday, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  { day: DayOfWeek.Wednesday, timeSlots: [{ start: '09:00', end: '12:30' }, { start: '14:00', end: '17:00' }] },
  { day: DayOfWeek.Thursday, timeSlots: [{ start: '09:00', end: '11:00' }, { start: '12:30', end: '17:00' }] },
  // { day: DayOfWeek.Saturday, timeSlots: [{ start: '03:00', end: '07:00' }, { start: '20:00', end: '23:00' }] },
  // { day: DayOfWeek.Saturday, timeSlots: [{ start: '20:00', end: '00:00' }] },
];

export const CUSTOM_SCHEDULE = [
  { start: new Date('2024-06-26 14:00 UTC').toISOString(), end: new Date('2024-06-26 19:00 UTC').toISOString() },
  // { start: new Date('2024-05-27 18:00 UTC').toISOString(), end: new Date('2024-05-27 22:00 UTC').toISOString() },
  // { start: new Date('2024-05-21 18:00 UTC').toISOString(), end: new Date('2024-05-21 23:00 UTC').toISOString() },
  // { end: '2024-05-11T04:00:00.000Z', start: '2024-05-11T02:30:00.000Z' },
  // { end: '2024-06-11T04:00:00.000Z', start: '2024-06-11T02:30:00.000Z' },
//  { end: '2024-05-31T04:00:00.000Z', start: '2024-05-31T02:30:00.000Z' },
];

export const STAFF_AVAILABILITIES = [
  mockStaffMemberAvailability({ staffMemberId: STAFF_MEMBER_IDS[0] }),
  mockStaffMemberAvailability({ staffMemberId: STAFF_MEMBER_IDS[1], defaultbusinessHours: DEFAULT_SCHEDULE }),
  mockStaffMemberAvailability({ staffMemberId: STAFF_MEMBER_IDS[2] }),
  mockStaffMemberAvailability({ staffMemberId: STAFF_MEMBER_IDS[3] }),
];

export const STAFF_MEMBER_AVAILABILITIES = [
  { startDateTime: `${today}T14:15:00.000Z`, endDateTime: `${today}T16:00:00.000Z` },
  { startDateTime: `${today}T17:00:00.000Z`, endDateTime: `${today}T20:00:00.000Z` },
];

export const SERVICE_OPTIONS = [
  mockServiceOption({
    id: '1',
    serviceOptionType: { optionItemId: 'bcee1023-3425-4b0b-a7ab-007c494c1206' },
    staffMembers: ['4eb26c9e-6eb7-46c3-96f1-6c9aeee7bc88', 'f6881215-bf50-45c9-a154-6d48d7d89afb'] }),
  mockServiceOption({
    id: 2,
    serviceOptionType: { optionItemId: 'a5f4e694-753a-494f-ade6-ffdefc99bdf8' },
    staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678', '7e6a2022-b8a4-40e5-a0f0-b8721712e3c3', '9941b9eb-9a77-4e60-921c-111153c2f7e8'] }),

  mockServiceOption({
    id: 3,
    serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
    staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  mockServiceOption({
    id: 4,
    serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
    staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),
  // mockServiceOption({
  //   id: 3,
  //   serviceOptionType: { optionItemId: 'ef922ec3-41de-476e-8afb-4b9e5d72b806' },
  //   staffMembers: ['8f05945f-0093-447f-80b2-cee1b0826678'] }),

];
