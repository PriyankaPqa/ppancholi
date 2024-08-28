import { BaseStoreComponents, filterAndSortActiveItems } from '@libs/stores-lib/base';
import { ref, Ref } from 'vue';
import { IAppointmentProgram, IDateRange, IDaySchedule, IdParams, AppointmentProgram, IServiceOption } from '@libs/entities-lib/appointment';
import { AppointmentProgramsService, IAppointmentProgramsServiceMock } from '@libs/services-lib/appointment-programs';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAppointmentProgram, IdParams>,
  service: AppointmentProgramsService | IAppointmentProgramsServiceMock,
  optionService: OptionItemsService | IOptionItemsServiceMock,
) {
  // For testing purposes only TODO remove later
  const schedule = ref({ defaultSchedule: null, customSchedule: null }) as Ref<{ defaultSchedule: IDaySchedule[], customSchedule: IDateRange[] }>;

  const serviceOptionTypesFetched = ref(false);
  const serviceOptionTypes = ref([]) as Ref<IOptionItem[]>;
  const appointmentModalitiesFetched = ref(false);
  const appointmentModalities = ref([]) as Ref<IOptionItem[]>;

  function getServiceOptionTypes(actualValue?: string[] | string, filterOutInactive = true) {
    return filterAndSortActiveItems(serviceOptionTypes.value, filterOutInactive, actualValue);
  }

  function getAppointmentModalities(actualValue?: string[] | string, filterOutInactive = true) {
    return filterAndSortActiveItems(appointmentModalities.value, filterOutInactive, actualValue);
  }

  async function fetchServiceOptionTypes() {
    if (!serviceOptionTypesFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.ServiceOptionTypes);
      if (data) {
        serviceOptionTypes.value = data;
        serviceOptionTypesFetched.value = true;
      }
    }

    return getServiceOptionTypes();
  }

  async function fetchAppointmentModalities() {
    if (!appointmentModalitiesFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.AppointmentModalities);
      if (data) {
        appointmentModalities.value = data;
        appointmentModalitiesFetched.value = true;
      }
    }

    return getServiceOptionTypes();
  }

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

  async function deleteAppointmentProgram(appointmentId: string): Promise<IAppointmentProgram> {
    const result = await service.delete(appointmentId);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function createServiceOption(appointmentProgramId: string, serviceOption:IServiceOption) : Promise<IAppointmentProgram> {
    const result = await service.createServiceOption(appointmentProgramId, serviceOption);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function updateServiceOption(appointmentProgramId: string, serviceOption:IServiceOption): Promise<IAppointmentProgram> {
    const result = await service.updateServiceOption(appointmentProgramId, serviceOption);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function deleteServiceOption(appointmentProgramId: string, serviceOptionId:string): Promise<IAppointmentProgram> {
    const result = await service.deleteServiceOption(appointmentProgramId, serviceOptionId);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function setAppointmentProgramStatus(appointmentId: uuid, aapointmentStatus: Status, rationale: string): Promise<IAppointmentProgram> {
    const result = await service.setAppointmentProgramStatus(appointmentId, aapointmentStatus, rationale);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    schedule,
    serviceOptionTypes,
    serviceOptionTypesFetched,
    appointmentModalities,
    appointmentModalitiesFetched,
    getServiceOptionTypes,
    getAppointmentModalities,
    fetchServiceOptionTypes,
    fetchAppointmentModalities,
    createAppointmentProgram,
    updateAppointmentProgram,
    deleteAppointmentProgram,
    createServiceOption,
    updateServiceOption,
    deleteServiceOption,
    setAppointmentProgramStatus,
  };
}
