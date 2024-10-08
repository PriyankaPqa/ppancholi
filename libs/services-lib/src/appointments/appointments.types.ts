import { IAppointment, IAppointmentRequest } from '@libs/entities-lib/appointment/appointment/appointment.types';
import { IdParams } from '@libs/entities-lib/src/appointment/appointment-program/appointment-program.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentsService extends IDomainBaseService<IAppointment, IdParams> {
  create(payload: IAppointmentRequest): Promise<IAppointment>;
  update(item: IAppointment): Promise<IAppointment>;
}

export interface IAppointmentsServiceMock extends IDomainBaseServiceMock<IAppointment> {
  create: jest.Mock<IAppointment>;
  update: jest.Mock<IAppointment>;

}
