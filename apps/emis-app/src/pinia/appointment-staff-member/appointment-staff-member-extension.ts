import { BaseStoreComponents } from '@libs/stores-lib/base';
import _cloneDeep from 'lodash/cloneDeep';
import { IAppointmentStaffMember, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentStaffMembersService, IAppointmentStaffMembersServiceMock } from '@libs/services-lib/appointment-staff-members';
import { Status } from '@libs/shared-lib/types';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointmentStaffMember, IdParams>,
  service: AppointmentStaffMembersService | IAppointmentStaffMembersServiceMock,
) {
  function getByAppointmentProgramId(appointmentProgramId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.appointmentProgramId === appointmentProgramId && x.status === Status.Active));
  }

  async function assignStaffMembers(appointmentId: string, staffMembers: Partial<IAppointmentStaffMember>[]) : Promise<IAppointmentStaffMember[]> {
    const result = await service.assignStaffMembers(appointmentId, staffMembers);
    if (result) {
      // baseComponents.addNewlyCreatedId(result);
      baseComponents.setAll(result);
    }
    return result;
  }

  return {
    getByAppointmentProgramId,
    assignStaffMembers,
  };
}
