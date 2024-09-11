import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { getMockExtensionComponents } from '@/pinia/appointment-staff-member/appointment-staff-member-extension.mock';

const storeId = 'appointment-StaffMember';

export const useMockAppointmentStaffMemberStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAppointmentStaffMemberStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockAppointmentStaffMember()]),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    appointmentStaffMemberStore: useAppointmentStaffMemberStore(),
  };
};
