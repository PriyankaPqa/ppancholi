import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockServiceOption, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { VDataTableA11y } from '@libs/component-lib/components';
import { EFilterKeyType } from '@libs/component-lib/types';
import Component from './StaffMembersTable.vue';

jest.mock('../appointmentProgramsHelper');
const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();
const { appointmentStaffMemberStore } = useMockAppointmentStaffMemberStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);

describe('StaffMembersTable.vue', () => {
  let wrapper;
  const mountWrapper = async (shallow = true, isEditMode = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        appointmentProgramId: 'appt-program-id',
        serviceOptions: [mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' } })],
        isEditMode,
      },
      ...otherOptions,
    });
  };

  describe('watcher', () => {
    describe('userAccountIds', () => {
      it('calls useUserAccountMetadataStore fetchByIds', async () => {
        jest.clearAllMocks();
        appointmentStaffMemberStore.items = [];
        await mountWrapper();
        appointmentStaffMemberStore.items = [mockAppointmentStaffMember()];
        await wrapper.vm.$nextTick();
        expect(userAccountMetadataStore.fetchByIds).toBeCalledWith([mockAppointmentStaffMember().userAccountId], true);
      });
    });
  });

  describe('Computed', () => {
    describe('customColumns', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        expect(wrapper.vm.customColumns).toEqual({
          name: 'displayName',
          role: 'role',
          serviceOption: 'serviceOption' });
      });
    });

    describe('headers', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        expect(JSON.stringify(wrapper.vm.headers)).toEqual(JSON.stringify(
          [
            {
              text: 'appointmentProgram.staffMembers.table.name',
              filterable: false,
              sortable: true,
              value: wrapper.vm.customColumns.name,
            },
            {
              text: 'appointmentProgram.staffMembers.table.role',
              filterable: false,
              sortable: false,
              value: wrapper.vm.customColumns.role,
            },
            {
              text: 'appointmentProgram.staffMembers.table.serviceOption',
              filterable: false,
              sortable: false,
              value: wrapper.vm.customColumns.serviceOption,
            },
          ],
        ));
      });
    });

    describe('serviceOptionTypes', () => {
      it('calls getServiceOptionTypes', async () => {
        await mountWrapper(false);
        expect(appointmentProgramStore.getServiceOptionTypes).toHaveBeenCalledWith(['id-1']);
      });
    });

    describe('userAccountIds', () => {
      it('returns the user account ids from the staff members', async () => {
        appointmentStaffMemberStore.getByAppointmentProgramId = jest.fn(() => [mockAppointmentStaffMember({ userAccountId: 'id-1' }),
          mockAppointmentStaffMember({ userAccountId: 'id-2' })]);
        await mountWrapper();
        expect(wrapper.vm.userAccountIds).toEqual(['id-1', 'id-2']);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call store fetchServiceOptionTypes, fetchStaffMembers and fetchByIds', async () => {
        await mountWrapper();

        wrapper.vm.fetchStaffMembers = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(appointmentProgramStore.fetchServiceOptionTypes).toHaveBeenCalled();
        expect(wrapper.vm.fetchStaffMembers).toHaveBeenCalled();
        await wrapper.vm.$nextTick();
        expect(userAccountMetadataStore.fetchByIds).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('getServiceOptionNames', () => {
      it('returns the right service option names from the userAccount id', async () => {
        await mountWrapper(true, true, { computed: {
          staffMembers: () => [mockAppointmentStaffMember({ userAccountId: 'user-id-1', serviceOptionIds: ['so-1', 'so-2'] })],
          serviceOptionTypes: () => [
            { id: 'type-id-1', name: { translation: { en: 'z-name' } } },
            { id: 'type-id-2', name: { translation: { en: 'a-name' } } },
            { id: 'type-id-3', name: { translation: { en: 'x-name' } } },
          ],
        } });
        await wrapper.setProps({ serviceOptions: [
          mockServiceOption({ id: 'so-1', serviceOptionType: { optionItemId: 'type-id-1' } }),
          mockServiceOption({ id: 'so-2', serviceOptionType: { optionItemId: 'type-id-2' } }),
          mockServiceOption({ id: 'so-3', serviceOptionType: { optionItemId: 'type-id-3' } }),
        ] });

        expect(wrapper.vm.getServiceOptionNames('user-id-1')).toEqual('a-name, z-name');
      });
    });

    describe('fetchStaffMembers', () => {
      it('calls useAppointmentStaffMemberStore search', async () => {
        await mountWrapper();
        await wrapper.vm.fetchStaffMembers();
        expect(appointmentStaffMemberStore.search).toHaveBeenCalledWith({ params: {
          filter: { 'Entity/AppointmentProgramId': { value: 'appt-program-id', type: EFilterKeyType.Guid } },
          top: 999,
          skip: 0,
        } });
      });
    });
  });

  describe('Template', () => {
    describe('data table', () => {
      it('renders', async () => {
        await mountWrapper(false);
        const dataTable = wrapper.findComponent(VDataTableA11y);
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', async () => {
        await mountWrapper(false);
        const headers = wrapper.findAll('th');

        expect(headers.wrappers[0].find('span').text()).toBe('appointmentProgram.staffMembers.table.name');
        expect(headers.wrappers[1].find('span').text()).toBe('appointmentProgram.staffMembers.table.role');
        expect(headers.wrappers[2].find('span').text()).toBe('appointmentProgram.staffMembers.table.serviceOption');
        // expect(headers.wrappers[4].find('span').text()).toBe('common.delete');
      });
    });

    describe('add button', () => {
      it('renders', async () => {
        await mountWrapper(false);
        const element = wrapper.findDataTest('add-staff-member-btn');
        expect(element.exists()).toBeTruthy();
      });
      it('is disabled when there are no service options', async () => {
        await mountWrapper(false);
        await wrapper.setProps({ serviceOptions: [] });
        const element = wrapper.findDataTest('add-staff-member-btn');
        expect(element.attributes('disabled')).toBe('disabled');
      });
    });
  });
});
