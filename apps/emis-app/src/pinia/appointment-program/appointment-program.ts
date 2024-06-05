import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IAppointmentProgram, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentProgramsService } from '@libs/services-lib/appointment-programs';
import { getExtensionComponents } from '@/pinia/appointment-program/appointment-program-extension';

export type Entity = IAppointmentProgram;

const storeId = 'appointment-program';
const entityService = new AppointmentProgramsService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAppointmentProgramStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
