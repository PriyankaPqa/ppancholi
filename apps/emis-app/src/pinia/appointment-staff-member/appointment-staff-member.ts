import { httpClient } from '@/services/httpClient';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { IAppointmentStaffMember, IdParams } from '@libs/entities-lib/appointment';
import { AppointmentStaffMembersService } from '@libs/services-lib/appointment-staff-members';
import { getExtensionComponents } from '@/pinia/appointment-staff-member/appointment-staff-member-extension';

export type Entity = IAppointmentStaffMember;

const storeId = 'appointment-staff-member';
const entityService = new AppointmentStaffMembersService(httpClient);

// baseComponents is used as a reference for the extension
const baseEntityComponents = getEntityStoreComponents<Entity, IdParams>(entityService);
const extensionComponents = getExtensionComponents(baseEntityComponents, entityService);

export const useAppointmentStaffMemberStore = defineStore(`${storeId}-entities`, () => ({
  ...baseEntityComponents,
  ...extensionComponents,
}));
