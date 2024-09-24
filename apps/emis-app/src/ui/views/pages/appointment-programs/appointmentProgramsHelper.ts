import { IAppointmentProgram } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';

export function mustHaveServiceOptions(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || !!appointmentProgram.serviceOptions.length;
}

export function canDeleteServiceOption(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.length > 1;
}

export function canSetActiveStatus(appointmentProgram: IAppointmentProgram, status: Status): boolean {
  return status === Status.Inactive || !!appointmentProgram.serviceOptions.length;
}
