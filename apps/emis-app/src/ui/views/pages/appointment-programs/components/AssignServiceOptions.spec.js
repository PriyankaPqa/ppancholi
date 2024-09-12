import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockAppointmentStaffMember, mockServiceOption } from '@libs/entities-lib/appointment';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';

import Component from './AssignServiceOptions.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('ManageStaffMembers.vue', () => {
  let wrapper;

  const mountWrapper = async (inTeamManagement = false, shallow = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        staffMembers: [mockAppointmentStaffMember()],
        users: [mockUserAccountMetadata()],
        serviceOptions: [mockServiceOption()],
        assignableTeamsIds: ['team-id'],
        inTeamManagement,
      },
      ...otherOptions,
    });
  };

  describe('lifecycle', () => {
    describe('created', () => {
      it('calls fetchServiceOptionTypes', async () => {
        await mountWrapper();
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(appointmentProgramStore.fetchServiceOptionTypes).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('customColumns', () => {
      it('returns all the columns, corresponding to the service options', async () => {
        await mountWrapper();
        await wrapper.setProps({ serviceOptions: [mockServiceOption({ id: 'id-1' }), mockServiceOption({ id: 'id-2' })] });
        expect(wrapper.vm.customColumns).toEqual({
          name: 'name',
          delete: 'delete',
          'id-1': 'so_id-1',
          'id-2': 'so_id-2',
        });
      });
    });

    describe('headers', () => {
      it('returns the right value if not in team management', async () => {
        await mountWrapper();
        wrapper.vm.getTypeName = jest.fn((x) => x);
        await wrapper.setProps({ serviceOptions: [
          mockServiceOption({ id: 'id-1', serviceOptionType: 'so-type-1' }), mockServiceOption({ id: 'id-2', serviceOptionType: 'so-type-2' })] });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'appointmentProgram.manageStaff.name',
            value: 'displayName',
            width: 'auto',
            sortable: true,
          },
          {
            text: 'so-type-1',
            sortable: false,
            align: 'center',
            value: 'so_id-1',
          },
          {
            text: 'so-type-2',
            sortable: false,
            align: 'center',
            value: 'so_id-2',
          },
          {
            text: '',
            sortable: false,
            align: 'end',
            value: 'delete',
          },
        ]);
      });
      it('returns the right value if in team management', async () => {
        await mountWrapper(true);
        wrapper.vm.getTypeName = jest.fn((x) => x);
        await wrapper.setProps({ serviceOptions: [
          mockServiceOption({ id: 'id-1', serviceOptionType: 'so-type-1' }), mockServiceOption({ id: 'id-2', serviceOptionType: 'so-type-2' })] });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'appointmentProgram.manageStaff.name',
            value: 'displayName',
            width: 'auto',
            sortable: true,
          },
          {
            text: 'so-type-1',
            sortable: false,
            align: 'center',
            value: 'so_id-1',
          },
          {
            text: 'so-type-2',
            sortable: false,
            align: 'center',
            value: 'so_id-2',
          },
        ]);
      });
    });
  });

  describe('methods', () => {
    describe('getTypeName', () => {
      it('returns the type name from the service option types', async () => {
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [{ id: '1', name: { translation: { en: 'name-1' } } }, { id: '2', name: { translation: { en: 'name-2' } } }]);
        await mountWrapper();

        const res = await wrapper.vm.getTypeName({ optionItemId: '2' });
        expect(res).toEqual('name-2');
      });
    });

    describe('getTeamNames', () => {
      it('returns the name of the teams of the team members', async () => {
        await mountWrapper();
        await wrapper.setProps({ assignableTeamsIds: ['t-1', 't-2', 't-3'] });

        const res = wrapper.vm.getTeamNames(mockUserAccountMetadata({ teams: [{ teamId: 't-1', name: 't-1-name' }, { teamId: 't-3', name: 't-3-name' }] }));
        expect(res).toEqual('t-1-name, t-3-name');
      });
    });

    describe('isMemberAssigned', () => {
      it('return if the member is assigned to the service option passed in the argument', async () => {
        await mountWrapper();
        await wrapper.setProps({
          staffMembers: [
            { userAccountId: 'm-1', serviceOptionIds: ['so-1'] },
            { userAccountId: 'm-2', serviceOptionIds: ['so-2'] },
            { userAccountId: 'm-3', serviceOptionIds: ['so-2'] },
          ],
        });

        expect(wrapper.vm.isMemberAssigned('so-2', 'm-2')).toBeTruthy();
        expect(wrapper.vm.isMemberAssigned('so-2', 'm-3')).toBeTruthy();
        expect(wrapper.vm.isMemberAssigned('so-2', 'm-1')).toBeFalsy();
        expect(wrapper.vm.isMemberAssigned('so-1', 'm-1')).toBeTruthy();
      });
    });

    describe('updateServiceOptionOnAssign', () => {
      it('adds the service option id to the right staff member if the checkbox is checked and emits the updated staff members', async () => {
        await mountWrapper();
        await wrapper.setProps({
          staffMembers: [
            { userAccountId: 'm-1', serviceOptionIds: ['so-1'] },
            { userAccountId: 'm-2', serviceOptionIds: ['so-2'] },
          ],
        });

        await wrapper.vm.updateServiceOptionOnAssign('m-2', 'so-1', true);
        expect(wrapper.emitted('update:staffMembers')[0][0]).toEqual([{ userAccountId: 'm-1', serviceOptionIds: ['so-1'] },
          { userAccountId: 'm-2', serviceOptionIds: ['so-2', 'so-1'] }]);
      });

      it('removes the service option from  the right staff member if the checkbox is unchecked and emits the updated staff members', async () => {
        await mountWrapper();
        await wrapper.setProps({
          staffMembers: [
            { userAccountId: 'm-1', serviceOptionIds: ['so-1'] },
            { userAccountId: 'm-2', serviceOptionIds: ['so-1', 'so-2'] },
          ],
        });

        await wrapper.vm.updateServiceOptionOnAssign('m-2', 'so-1', false);
        expect(wrapper.emitted('update:staffMembers')[0][0]).toEqual([{ userAccountId: 'm-1', serviceOptionIds: ['so-1'] },
          { userAccountId: 'm-2', serviceOptionIds: ['so-2'] }]);
      });
    });

    describe('onRemoveUser', () => {
      it('emits remove with the user id', async () => {
        await mountWrapper();

        await wrapper.vm.onRemoveUser('m-1');
        expect(wrapper.emitted('removeUser')[0][0]).toEqual('m-1');
      });
    });
  });

  describe('Template', () => {
    describe('service options table', () => {
      it('renders', async () => {
        await mountWrapper();
        const element = wrapper.findDataTest('assign-service-options__table');
        expect(element.exists()).toBeTruthy();
      });
      it('contains the right number of columns if not in team management', async () => {
        await mountWrapper(false, false);
        wrapper.vm.getTypeName = jest.fn((x) => x);
        await wrapper.setProps({ serviceOptions: [mockServiceOption({ id: 'id-1', serviceOptionType: 't-1' }),
          mockServiceOption({ id: 'id-2', serviceOptionType: 't-2' })] });
        const headers = wrapper.findAll('th');
        expect(headers.length)
          .toBe(4);

        expect(headers.wrappers[0].find('span')
          .text())
          .toBe('appointmentProgram.manageStaff.name');
        expect(headers.wrappers[1].find('span')
          .text())
          .toBe('t-1');
        expect(headers.wrappers[2].find('span')
          .text())
          .toBe('t-2');
      });
      it('contains the right number of columns if  in team management', async () => {
        await mountWrapper(true, false);
        await wrapper.setProps({ serviceOptions: [mockServiceOption({ id: 'id-1' }), mockServiceOption({ id: 'id-2' })] });
        const headers = wrapper.findAll('th');
        expect(headers.length)
          .toBe(3);
      });
    });
  });
});
