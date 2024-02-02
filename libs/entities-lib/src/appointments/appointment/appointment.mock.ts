import { mockBaseData } from '../../base';
import { IAppointmentEntity, ICustomer } from './appointment.types';

export const mockCustomer = (force?: Partial<ICustomer>): ICustomer => ({
    customerId: 'customer-id-1',
    emailAddress: 'customer-email@email.com',
    name: 'John White',
    timeZone: 'America/New_York',
    ...force,
  });

export const mockAppointment = (force? : Partial<IAppointmentEntity>): IAppointmentEntity => ({
  ...mockBaseData(),
  customers: [mockCustomer()],
  // duration: string; ??
  startDateTime: {
    dateTime: '2024-01-29T16:00:00.000Z',
    timeZone: 'America/New_York',
  },
  endDateTime: {
    dateTime: '2024-01-29T18:00:00.000Z',
    timeZone: 'America/New_York',
  },
  id: 'apptm-id-1',
  isLocationOnline: false,
  serviceId: 'service-id-1',
  serviceName: 'Service One',
  staffMemberIds: ['staff-id-1'],

  ...force,
});
