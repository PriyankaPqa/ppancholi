import { mockAppointmentStaffMembersService } from '@libs/services-lib/appointment-staff-members';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { IAppointmentStaffMember, IdParams, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { getExtensionComponents } from '@/pinia/appointment-staff-member/appointment-staff-member-extension';

const entityService = mockAppointmentStaffMembersService();
const baseComponents = getBaseStoreComponents<IAppointmentStaffMember, IdParams>(entityService);

const createTestStore = (opts = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      'test-appointment-staff-member': {

      },
    },
    stubActions: false,
  });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useAppointmentStaffMemberStore = defineStore('test-appointment-StaffMember', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useAppointmentStaffMemberStore(pinia);
};

describe('Appointment StaffMember store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStaffMembers', () => {
    it('should call updateStaffMembers service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const staffMember = mockAppointmentStaffMember();
      const res = {} as IAppointmentStaffMember;
      entityService.updateStaffMembers = jest.fn(() => res);
      await store.updateStaffMembers(staffMember);

      expect(entityService.updateStaffMembers).toBeCalledWith(staffMember);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
  });
