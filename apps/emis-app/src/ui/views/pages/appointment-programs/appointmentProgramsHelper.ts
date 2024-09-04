import { IAppointmentProgram } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';

export function validateMustHaveServiceOptionsPolicy(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || !!appointmentProgram.serviceOptions.length;
}

export function validateCanDeleteServiceOptionPolicy(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.length > 1;
}

export function validateHasStaffMembersPolicy(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.some((so) => !!so.staffMembers?.length);
}

export function validateCanSetActiveStatus(appointmentProgram: IAppointmentProgram, status: Status): boolean {
  return status === Status.Inactive || appointmentProgram.serviceOptions.some((so) => !!so.staffMembers?.length);
}
