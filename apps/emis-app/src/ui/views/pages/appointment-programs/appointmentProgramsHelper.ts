import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IAppointmentProgram } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';

export function mustHaveServiceOptions(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || !!appointmentProgram.serviceOptions.length;
}

export function canDeleteServiceOption(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.length > 1;
}

export function mustHaveStaffMembers(appointmentProgram: IAppointmentProgram): boolean {
  return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.some((so) => !!so.staffMembers?.length);
}

export function canSetActiveStatus(appointmentProgram: IAppointmentProgram, status: Status): boolean {
  return status === Status.Inactive || appointmentProgram.serviceOptions.some((so) => !!so.staffMembers?.length);
}

export async function deleteServiceOption(serviceOptionId: string, appointmentProgram: IAppointmentProgram, vue: Vue): Promise<boolean> {
  if (!canDeleteServiceOption(appointmentProgram)) {
    vue.$message({ title: vue.$t('common.error'), message: vue.$t('appointmentProgram.serviceOption.deleteUniqueServiceOption.error') });
    return false;
  }

  const userChoice = await vue.$confirm({
    title: vue.$t('appointmentProgram.serviceOption.confirm.delete.title'),
    messages: vue.$t('appointmentProgram.serviceOption.confirm.delete.message'),
   });

  if (userChoice) {
    const res = await useAppointmentProgramStore().deleteServiceOption(appointmentProgram.id, serviceOptionId);
    if (res) {
      vue.$toasted.global.success(vue.$t('appointmentProgram.serviceOption.delete.success'));
      return true;
    }
      vue.$toasted.global.error(vue.$t('appointmentProgram.serviceOption.delete.error'));
      return false;
  }
  return false;
}
