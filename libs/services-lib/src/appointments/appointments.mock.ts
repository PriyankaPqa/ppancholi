import { mockAppointment } from '@libs/entities-lib/appointment';

import { mockDomainBaseService } from '../base';
import { IAppointmentsServiceMock } from './appointments.types';

export const mockAppointmentsService = (): IAppointmentsServiceMock => ({
  ...mockDomainBaseService(mockAppointment()),
  create: jest.fn(() => mockAppointment()),
  update: jest.fn(() => mockAppointment()),

});
