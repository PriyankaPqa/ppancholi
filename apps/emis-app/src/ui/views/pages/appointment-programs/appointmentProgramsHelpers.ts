import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { useAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member';
import { IAppointmentProgram, IAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';

export default {
  validServiceOptionsCount(appointmentProgram: IAppointmentProgram): boolean {
    return appointmentProgram.appointmentProgramStatus === Status.Inactive || !!appointmentProgram.serviceOptions.length;
  },

  canDeleteServiceOption(appointmentProgram: IAppointmentProgram): boolean {
    return appointmentProgram.appointmentProgramStatus === Status.Inactive || appointmentProgram.serviceOptions.length > 1;
  },

  canSetActiveStatus(appointmentProgram: IAppointmentProgram, status: Status): boolean {
    return status === Status.Inactive || !!appointmentProgram.serviceOptions.length;
  },

  async  updateStaffMembers(appointmentProgramId: string, staffMembersPayload: Partial<IAppointmentStaffMember>[], vue: Vue): Promise<boolean> {
    const res = await useAppointmentStaffMemberStore().assignStaffMembers(appointmentProgramId, staffMembersPayload);
    if (res) {
      vue.$toasted.global.success(vue.$t('appointmentProgram.staffMember.updated.success'));
      return true;
    }

    vue.$toasted.global.error(vue.$t('appointmentProgram.staffMember.updated.failed'));
    return false;
  },

  async deleteServiceOption(serviceOptionId: string, appointmentProgram: IAppointmentProgram, vue: Vue): Promise<boolean> {
    if (!this.canDeleteServiceOption(appointmentProgram)) {
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
  },
};
