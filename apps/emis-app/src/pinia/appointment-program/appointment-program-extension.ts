import { BaseStoreComponents } from '@libs/stores-lib/base';
import { ref, Ref } from 'vue';
import { IAppointmentProgram, IDateRange, IDaySchedule, IdParams, AppointmentProgram, AppointmentProgramStatus } from '@libs/entities-lib/appointment';
import { AppointmentProgramsService, IAppointmentProgramsServiceMock } from '@libs/services-lib/appointment-programs';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointmentProgram, IdParams>,
  service: AppointmentProgramsService | IAppointmentProgramsServiceMock,
) {
  // For testing purposes only TODO remove later
  const schedule = ref({ defaultSchedule: null, customSchedule: null }) as Ref<{ defaultSchedule: IDaySchedule[], customSchedule: IDateRange[] }>;

  async function createAppointmentProgram(appointment: AppointmentProgram) : Promise<IAppointmentProgram> {
    const result = await service.create(appointment);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function updateAppointmentProgram(appointment: AppointmentProgram): Promise<IAppointmentProgram> {
    const result = await service.update(appointment);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function setAppointmentProgramStatus(appointmentId: uuid, aapointmentStatus: AppointmentProgramStatus, rationale: string): Promise<IAppointmentProgram> {
    const result = await service.setAppointmentProgramStatus(appointmentId, aapointmentStatus, rationale);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    schedule,
    createAppointmentProgram,
    updateAppointmentProgram,
    setAppointmentProgramStatus,
  };
}
