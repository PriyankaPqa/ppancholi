import { createLocalVue, shallowMount } from '@/test/testSetup';

import { useMockTeamStore } from '@/pinia/team/team.mock';
import { MassActionType, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import Component from './AddRemoveTeamMembersMassActionDetailsTable.vue';

const localVue = createLocalVue();
const { pinia, teamStore } = useMockTeamStore();

describe('AddRemoveTeamMembersMassActionDetailsTable', () => {
  const wrapper = shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      massAction: mockMassActionEntity({ type: MassActionType.AddRemoveTeamMembers, details: { teamId: 'team-id-1' } }),
    },
  });

  describe('Methods', () => {
    describe('fetchTeam', () => {
      it('should call team store fetch method with teamId from the mass action details', async () => {
        teamStore.fetch = jest.fn();
        await wrapper.vm.fetchTeam();
        expect(teamStore.fetch).toHaveBeenCalledWith('team-id-1');
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should call fetchTeam', () => {
        wrapper.vm.fetchTeam = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(wrapper.vm.fetchTeam).toHaveBeenCalled();
      });
    });
  });
});
