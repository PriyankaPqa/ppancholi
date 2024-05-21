import { BaseStoreComponents } from '@libs/stores-lib/base';
// import { ref, Ref } from 'vue';
import { IAppointmentProgram, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentProgramsService, IAppointmentProgramsServiceMock } from '@libs/services-lib/appointment-programs';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointmentProgram, IdParams>,
  service: AppointmentProgramsService | IAppointmentProgramsServiceMock,
) {
  async function addAppointmentProgram(appointment: IAppointmentProgram) : Promise<IAppointmentProgram> {
    const result = await service.create(appointment);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function editAppointmentProgram(appointment: IAppointmentProgram): Promise<IAppointmentProgram> {
    const result = await service.update(appointment);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    addAppointmentProgram,
    editAppointmentProgram,
  };
}
