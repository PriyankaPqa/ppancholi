import { BaseStoreComponents } from '@libs/stores-lib/base';
import { IAppointmentStaffMember, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentStaffMembersService, IAppointmentStaffMembersServiceMock } from '@libs/services-lib/appointment-staff-members';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointmentStaffMember, IdParams>,
  service: AppointmentStaffMembersService | IAppointmentStaffMembersServiceMock,
) {
  async function updateStaffMembers(appointment: IAppointmentStaffMember) : Promise<IAppointmentStaffMember> {
    const result = await service.create(appointment);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  return {
    updateStaffMembers,
  };
}
