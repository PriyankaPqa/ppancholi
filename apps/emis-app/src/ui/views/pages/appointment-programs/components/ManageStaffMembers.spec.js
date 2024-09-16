import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockServiceOption, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { EFilterKeyType } from '@libs/component-lib/types';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { mockTeamEntity } from '@libs/entities-lib/team';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { mustHaveStaffMembers } from '../appointmentProgramsHelper';

import Component from './ManageStaffMembers.vue';

jest.mock('../appointmentProgramsHelper');
const localVue = createLocalVue();
const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);
const { appointmentStaffMemberStore } = useMockAppointmentStaffMemberStore(pinia);

describe('ManageStaffMembers.vue', () => {
  let wrapper;

  const mountWrapper = async (isEditMode = true, otherOptions = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        appointmentProgramId: 'appt-program-id',
        eventId: 'eventId',
        serviceOptions: [mockServiceOption()],
        isEditMode,
        initialStaffMembers: [],
      },
      ...otherOptions,
    });
  };

  describe('lifecycle', () => {
    describe('created', () => {
      it('calls fetchAssignableTeams', async () => {
        await mountWrapper();
        wrapper.vm.fetchAssignableTeams = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(wrapper.vm.fetchAssignableTeams).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'appointmentProgram.manageStaff.name',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'Metadata/DisplayName',
          },
          {
            text: '',
            class: 'team_member_header',
            sortable: false,
            align: 'end',
            value: 'checkbox',
          },
        ]);
      });
    });

    describe('userAccountIds', () => {
      it('returns the user account ids from the staff members', async () => {
        await mountWrapper();
        await wrapper.setData({ staffMembers: [mockAppointmentStaffMember({ userAccountId: 'id-1' }), mockAppointmentStaffMember({ userAccountId: 'id-2' })] });
        expect(wrapper.vm.userAccountIds).toEqual(['id-1', 'id-2']);
      });
    });
  });

  describe('watcher', () => {
    describe('selectedTeam.id', () => {
      it('resets the search if an id is passed', async () => {
        await mountWrapper();
        await wrapper.setData({ searchTerm: 'term1', params: { filter: '' } });

        wrapper.vm.goToFirstPage = jest.fn();
        wrapper.vm.search = jest.fn();
        await wrapper.setData({ selectedTeam: { id: 'newId' } });
        expect(wrapper.vm.goToFirstPage).toHaveBeenCalled();
        expect(wrapper.vm.searchTerm).toEqual('');
        expect(wrapper.vm.search).toHaveBeenCalled();
      });
    });
  });

  describe('methods', () => {
    describe('fetchAssignableTeams', () => {
      it('calls team store and stores the result in the assignableTeams variable', async () => {
        await mountWrapper();
        teamStore.search = jest.fn(() => ({ values: [mockTeamEntity()] }));
        await wrapper.vm.fetchAssignableTeams();
        expect(teamStore.search).toHaveBeenCalledWith({ params: {
          filter: { Entity: { UseForAppointments: true, Events: { any: { Id: { value: 'eventId', type: EFilterKeyType.Guid } } } } },
          orderBy: 'Entity/Name asc',
        } });
        expect(wrapper.vm.assignableTeams).toEqual([mockTeamEntity()]);
      });
    });

    describe('isMemberSelected', () => {
      it('returns true only if the member is in the list of allStaffMembers', async () => {
        await mountWrapper();
        await wrapper.setData({ staffMembers: [mockAppointmentStaffMember({ userAccountId: 'm-id-1' }), mockAppointmentStaffMember({ userAccountId: 'm-id-2' })] });
        expect(wrapper.vm.isMemberSelected('m-id-1')).toBeTruthy();
        expect(wrapper.vm.isMemberSelected('m-id-3')).toBeFalsy();
      });
    });

    describe('isPrimaryContact', () => {
      it('returns true only if the member passed as argument is primary contact in the team', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedTeam:
          mockTeamEntity({ teamMembers: [{ id: 'primary-id', isPrimaryContact: true }, { id: 'other-id', isPrimaryContact: false }] }) });
        expect(wrapper.vm.isPrimaryContact('primary-id')).toBeTruthy();
        expect(wrapper.vm.isPrimaryContact('other-id')).toBeFalsy();
      });
    });

    describe('onSelectTeamMember', () => {
      it('calls addUser if value is true', async () => {
        const item = mockUserAccountMetadata();
        await mountWrapper();
        wrapper.vm.addUser = jest.fn();
        await (wrapper.vm.onSelectTeamMember({ item, value: true }));
        expect(wrapper.vm.addUser).toHaveBeenCalledWith(item.id);
      });
      it('calls removeUser if value is false', async () => {
        const item = mockUserAccountMetadata();
        await mountWrapper();
        wrapper.vm.removeUser = jest.fn();
        await (wrapper.vm.onSelectTeamMember({ item, value: false }));
        expect(wrapper.vm.removeUser).toHaveBeenCalledWith(item.id);
      });
    });

    describe('addAllTeamMembers', () => {
      it(' calls userAccount store fetch with all ids of the members in the selected team and calls add user with each member', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedTeam: mockTeamEntity({ teamMembers: [{ id: 'm-1' }, { id: 'm-2' }] }) });
        // userAccountMetadataStore.fetchByIds = jest.fn(() => [mockUserAccountMetadata({ id: 'u-1' }), mockUserAccountMetadata({ id: 'u-2' })]);
        wrapper.vm.addUser = jest.fn();
        await wrapper.vm.addAllTeamMembers();
        expect(userAccountMetadataStore.fetchByIds).toHaveBeenCalledWith(['m-1', 'm-2'], true);
        expect(wrapper.vm.addUser).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.addUser).toHaveBeenCalledWith('m-1');
        expect(wrapper.vm.addUser).toHaveBeenCalledWith('m-2');
      });
    });

    describe('fetchData', () => {
      it('calls the combined user account store search and returns the result', async () => {
        await mountWrapper();
        wrapper.vm.combinedUserAccountStore.search = jest.fn(() => ({ values: [mockUserAccountMetadata({ id: 'u-1' }), mockUserAccountMetadata({ id: 'u-2' })] }));
        await wrapper.setData({ selectedTeam: mockTeamEntity({ id: 'team-id' }), searchTerm: 'search-term' });

        const result = await wrapper.vm.fetchData({ top: 10, skip: 0, orderBy: 'orderBy' });
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: {
            Metadata: {
              TeamsAsString: { contains: 'team-id' },
              DisplayName: { contains: 'search-term' },
            },
          },
          top: 10,
          skip: 0,
          orderBy: 'orderBy',
          count: true,
        }, null, false, true);
        expect(result).toEqual({ values: [mockUserAccountMetadata({ id: 'u-1' }), mockUserAccountMetadata({ id: 'u-2' })] });
      });
    });

    describe(' addUser', () => {
      it('adds a new staff member to the list of staff members', async () => {
        await mountWrapper();
        await wrapper.setData({ staffMembers: [] });
        await wrapper.vm.addUser('u-1');
        expect(wrapper.vm.staffMembers).toEqual([{ userAccountId: 'u-1', serviceOptionIds: [] }]);
      });
    });

    describe('removeUser', () => {
      it('removes the staff member from the list of staff members', async () => {
        await mountWrapper();
        await wrapper.setData({ staffMembers: [{ userAccountId: 'u-1', serviceOptionIds: ['so-1'] }, { userAccountId: 'u-2', serviceOptionIds: ['so-2'] }] });
        await wrapper.vm.removeUser('u-2');
        expect(wrapper.vm.staffMembers).toEqual([{ userAccountId: 'u-1', serviceOptionIds: ['so-1'] }]);
      });
    });

    describe('onSubmit', () => {
      it('shows an error message if not all users are assigned', async () => {
        await mountWrapper();
        wrapper.vm.allMembersAreAssigned = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'appointmentProgram.manageStaff.error.notAllMembersAreAssigned' });
        expect(appointmentStaffMemberStore.assignStaffMembers).not.toHaveBeenCalled();
      });

      // it('shows an error message in edit mode if mustHaveStaffMembers fails', async () => {
      //   await mountWrapper();
      //   wrapper.vm.allMembersAreAssigned = jest.fn(() => true);
      //   mustHaveStaffMembers.mockImplementation(() => false);
      //   await wrapper.vm.onSubmit();
      //   expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'appointmentProgram.manageStaff.error.atLeastOneStaffMember' });
      //   expect(appointmentStaffMemberStore.assignStaffMembers).not.toHaveBeenCalled();
      // });

      it('calls store method in edit mode', async () => {
        await mountWrapper();
        wrapper.vm.allMembersAreAssigned = jest.fn(() => true);
        // mustHaveStaffMembers.mockImplementation(() => true);
        const staffMembers = [mockAppointmentStaffMember({ userAccountId: 'u-1', serviceOptionIds: ['so-1'] })];
        wrapper.setData({ staffMembers });
        await wrapper.vm.onSubmit();
        expect(appointmentStaffMemberStore.assignStaffMembers).toHaveBeenCalledWith('appt-program-id', staffMembers);

        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.staffMember.updated.success');
      });

      it('adds removed staff members to the payload', async () => {
        await mountWrapper();
        const newMembers = [mockAppointmentStaffMember({ userAccountId: 'u-id-1', serviceOptionIds: ['so-1'] }),
          mockAppointmentStaffMember({ userAccountId: 'u-id-2', serviceOptionIds: 'so-2' })];
        await wrapper.setProps({ initialStaffMembers: [mockAppointmentStaffMember({ userAccountId: 'u-removed-id', serviceOptionIds: ['so-1'] })] });
        await wrapper.setData({ staffMembers: newMembers });

        await wrapper.vm.onSubmit();

        expect(appointmentStaffMemberStore.assignStaffMembers).toHaveBeenCalledWith('appt-program-id', [
          ...newMembers, { userAccountId: 'u-removed-id', serviceOptionIds: [] },
        ]);
      });

      it('shows error message if store call fails in edit mode', async () => {
        await mountWrapper();
        wrapper.vm.allMembersAreAssigned = jest.fn(() => true);
        mustHaveStaffMembers.mockImplementation(() => true);
        appointmentStaffMemberStore.assignStaffMembers = jest.fn();
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.staffMember.updated.failed');
      });

      // it('emits the data if not in edit mode', async () => {
      //   await mountWrapper(false);
      //   wrapper.vm.allMembersAreAssigned = jest.fn(() => true);
      //   await wrapper.vm.onSubmit();
      //   expect(wrapper.emitted('submit')[0][0]).toEqual(wrapper.vm.localServiceOptions);
      //   expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      // });
    });
  });

  describe('Template', () => {
    describe('teams dropdown', () => {
      it('renders', async () => {
        await mountWrapper();
        const element = wrapper.findDataTest('manage-staff-select-team');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('team members table', () => {
      it('renders only if a team is selected', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedTeam: mockTeamEntity() });
        const element = wrapper.findDataTest('manage-staff-members-team-members-table');
        expect(element.exists()).toBeTruthy();
        await wrapper.setData({ selectedTeam: null });
        const element2 = wrapper.findDataTest('manage-staff-members-team-members-table');
        expect(element2.exists()).toBeFalsy();
      });
    });
  });
});
