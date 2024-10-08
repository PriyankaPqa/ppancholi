import { BaseEntityStoreComponents } from '@libs/stores-lib/base';
import _cloneDeep from 'lodash/cloneDeep';
import { IAppointmentStaffMember, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentStaffMembersService, IAppointmentStaffMembersServiceMock } from '@libs/services-lib/appointment-staff-members';
import { Status } from '@libs/shared-lib/types';
import { EFilterKeyType } from '@libs/component-lib/types';

export function getExtensionComponents(
  baseComponents: BaseEntityStoreComponents<IAppointmentStaffMember, IdParams>,
  service: AppointmentStaffMembersService | IAppointmentStaffMembersServiceMock,
) {
  function getByAppointmentProgramId(appointmentProgramId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.appointmentProgramId === appointmentProgramId
    && x.status === Status.Active && !!x.serviceOptionIds.length));
  }

  async function fetchByAppointmentProgramId(appointmentprogramId: string) : Promise<IAppointmentStaffMember[]> {
    const result = await baseComponents.search({ params: {
      filter: { 'Entity/AppointmentProgramId': { value: appointmentprogramId, type: EFilterKeyType.Guid } },
      skip: 0,
    } });
    return result?.values;
  }

  async function assignStaffMembers(appointmentProgramId: string, staffMembers: Partial<IAppointmentStaffMember>[]) : Promise<IAppointmentStaffMember[]> {
    const result = await service.assignStaffMembers(appointmentProgramId, staffMembers);
    if (result) {
      baseComponents.setAll(result);
    }
    return result;
  }

  return {
    fetchByAppointmentProgramId,
    getByAppointmentProgramId,
    assignStaffMembers,
  };
}
