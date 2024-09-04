import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockServiceOption } from '@libs/entities-lib/appointment';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { EFilterKeyType } from '@libs/component-lib/types';
import { useMockTeamStore } from '@/pinia/team/team.mock';

import { mockTeamEntity } from '@libs/entities-lib/team';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import Component from './ManageStaffMembers.vue';

const localVue = createLocalVue();
const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);

describe('ManageStaffMembers.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, isEditMode = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
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
      it('calls team store and stores the result in the teams variable', async () => {
        await mountWrapper();
        teamStore.search = jest.fn(() => ({ values: [mockTeamEntity()] }));
        await wrapper.vm.fetchAssignableTeams();
        expect(teamStore.search).toHaveBeenCalledWith({ params: {
          filter: { Entity: { UseForAppointments: true, Events: { any: { Id: { value: 'eventId', type: EFilterKeyType.Guid } } } } },
          orderBy: 'Entity/Name asc',
        } });
        expect(wrapper.vm.teams).toEqual([mockTeamEntity()]);
      });
    });

    describe('isMemberSelected', () => {
      it('returns true only if the member is in the list of allStaffMembers', async () => {
        await mountWrapper();
        await wrapper.setData({ allStaffMembers: [{ id: 'm-id-1' }, { id: 'm-id-2' }] });
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
      it('adds the passed team member to the list of staff members if value is true', async () => {
        const item = mockUserAccountMetadata();
        await mountWrapper();
        await (wrapper.vm.onSelectTeamMember({ item, value: true }));
        expect(wrapper.vm.allStaffMembers).toContain(item);
      });

      it('removes the passed team from the list of staff members and service options', async () => {
        const item = mockUserAccountMetadata({ id: 'my-id' });
        await mountWrapper();
        await wrapper.setData({ allStaffMembers: [mockUserAccountMetadata({ id: 'my-id' }), mockUserAccountMetadata({ id: 'other-id' })],
          localServiceOptions: [{ id: 'so-1', staffMembers: ['my-id', 'other-id'] }, { id: 'so-2', staffMembers: ['other-id-2'] }],
        });
        await wrapper.vm.onSelectTeamMember({ item, value: false });
        expect(wrapper.vm.allStaffMembers).toEqual([mockUserAccountMetadata({ id: 'other-id' })]);
        expect(wrapper.vm.localServiceOptions).toEqual([{ id: 'so-1', staffMembers: ['other-id'] }, { id: 'so-2', staffMembers: ['other-id-2'] }]);
      });
    });

    describe('addAllTeamMembers', () => {
      it(' calls userAccount store fetch with all ids of the members in the selected team and adds all data to allStaffMembers list', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedTeam: mockTeamEntity({ teamMembers: [{ id: 'm-1' }, { id: 'm-2' }] }) });
        userAccountMetadataStore.fetchByIds = jest.fn(() => [mockUserAccountMetadata({ id: 'u-1' }), mockUserAccountMetadata({ id: 'u-2' })]);

        await wrapper.vm.addAllTeamMembers();
        expect(userAccountMetadataStore.fetchByIds).toHaveBeenCalledWith(['m-1', 'm-2'], true);
        expect(wrapper.vm.allStaffMembers).toEqual([mockUserAccountMetadata({ id: 'u-1' }), mockUserAccountMetadata({ id: 'u-2' })]);
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
  });
});
