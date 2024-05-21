import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IAppointment, IdParams,
} from '@libs/entities-lib/appointment';
import { AppointmentsService } from '@libs/services-lib/appointments';
import { getExtensionComponents } from '@/pinia/appointment/appointment-extension';

export type Entity = IAppointment;

const storeId = 'appointment';
const entityService = new AppointmentsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAppointmentStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
