import { BaseStoreComponents } from '@libs/stores-lib/base';
// import { ref, Ref } from 'vue';
import { IAppointment, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentsService, IAppointmentsServiceMock } from '@libs/services-lib/appointments';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointment, IdParams>,
  service: AppointmentsService | IAppointmentsServiceMock,
) {
  async function addAppointment(appointment: IAppointment) : Promise<IAppointment> {
    const result = await service.create(appointment);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function editAppointment(appointment: IAppointment): Promise<IAppointment> {
    const result = await service.update(appointment);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    addAppointment,
    editAppointment,
  };
}
