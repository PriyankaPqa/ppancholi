import { mockAppointmentStaffMembersService } from '@libs/services-lib/appointment-staff-members';
import { getEntityStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { IAppointmentStaffMember, IdParams, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { getExtensionComponents } from '@/pinia/appointment-staff-member/appointment-staff-member-extension';
import { EFilterKeyType } from '@libs/component-lib/types';

const entityService = mockAppointmentStaffMembersService();
const baseComponents = getEntityStoreComponents<IAppointmentStaffMember, IdParams>(entityService);

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

  describe('getByAppointmentProgramId', () => {
    it('returns the staf members belonging to one program and having service option ids', async () => {
      const store = createTestStore(baseComponents);
      const m1 = mockAppointmentStaffMember({ appointmentProgramId: 'other-id' });
      const m2 = mockAppointmentStaffMember({ appointmentProgramId: 'ap-id', serviceOptionIds: [] });
      const m3 = mockAppointmentStaffMember({ appointmentProgramId: 'ap-id', serviceOptionIds: ['so-1'] });
      store.items = [m1, m2, m3];
      expect(store.getByAppointmentProgramId('ap-id')).toEqual([m3]);
    });
  });

  describe('fetchByAppointmentProgramId', () => {
    it('should call search with the good params and save the result', async () => {
      const mockStaffMember = mockAppointmentStaffMember();
      const bComponents = { ...baseComponents, setAll: jest.fn(), search: jest.fn(() => ({ values: [mockStaffMember] })) };
      const store = createTestStore(bComponents);
      await store.fetchByAppointmentProgramId('ap-1');
      expect(bComponents.search).toHaveBeenCalledWith({ params: {
        filter: { 'Entity/AppointmentProgramId': { value: 'ap-1', type: EFilterKeyType.Guid } },
        skip: 0,
      } });
      expect(bComponents.setAll).toBeCalledWith([mockStaffMember]);
    });
  });

  describe('assignStaffMembers', () => {
    it('should call assignStaffMembers service with proper params', async () => {
      const bComponents = { ...baseComponents, setAll: jest.fn() };
      const store = createTestStore(bComponents);
      const staffMember = mockAppointmentStaffMember();
      const res = [{}] as IAppointmentStaffMember[];
      entityService.assignStaffMembers = jest.fn(() => res);
      await store.assignStaffMembers('id', [staffMember]);

      expect(entityService.assignStaffMembers).toBeCalledWith('id', [staffMember]);
      expect(bComponents.setAll).toBeCalledWith(res);
    });
  });
  });
