import { createLocalVue, shallowMount } from '@/test/testSetup';
import { MassActionType, mockMassActionEntity, TeamMembersMassActionType } from '@libs/entities-lib/mass-action';
import Component from './AddRemoveTeamMembersMassActionDetails.vue';

const localVue = createLocalVue();

describe('AddRemoveTeamMembersMassActionDetails', () => {
  let wrapper;

  describe('Computed', () => {
    describe('isAddMembers', () => {
      it('should return correct data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.AddTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.isAddMembers).toEqual(true);

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.RemoveTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.isAddMembers).toEqual(false);
      });
    });

    describe('title', () => {
      it('should return proper data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.AddTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.title).toEqual('massAction.addRemoveTeamMembers.create.title.add');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.RemoveTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.title).toEqual('massAction.addRemoveTeamMembers.create.title.remove');
      });
    });

    describe('processingTitle', () => {
      it('should return proper data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.AddTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.processingTitle).toEqual('massAction.addRemoveTeamMembers.status.processing.title.add');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.RemoveTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.processingTitle).toEqual('massAction.addRemoveTeamMembers.status.processing.title.remove');
      });
    });

    describe('preProcessingTitle', () => {
      it('should return proper data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.AddTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.preProcessingTitle).toEqual('massAction.addRemoveTeamMembers.status.preprocessing.title.add');

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            massAction: () => mockMassActionEntity({
              type: MassActionType.AddRemoveTeamMembers,
              details: {
                teamMembersMassActionType: TeamMembersMassActionType.RemoveTeamMember,
              },
            }),
          },
        });
        expect(wrapper.vm.preProcessingTitle).toEqual('massAction.addRemoveTeamMembers.status.preprocessing.title.remove');
      });
    });
  });
});
