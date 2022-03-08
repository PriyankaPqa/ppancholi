import { createLocalVue, mount } from '@/test/testSetup';
import { mockCombinedUserAccount } from '@/entities/user-account';
import { mockTeamEntity } from '@/entities/team';

import Component from '../case-file-activity/components/AssignedList.vue';

const localVue = createLocalVue();

const mockIndividual = mockCombinedUserAccount();

describe('AssignedList.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
      propsData: {
        assignedTeams: [mockTeamEntity()],
        assignedIndividuals: [mockIndividual],
        isViewOnly: false,
      },
    });
  });

  describe('Template', () => {
    describe('assigned teams list', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('assigned-teams-list');
        expect(element.exists()).toBeTruthy();
      });

      it('contains assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-teams-list-item-${mockTeamEntity().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays name of assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-teams-list-item-${mockTeamEntity().id}`);
        expect(element.text()).toContain(mockTeamEntity().name);
      });

      it('contains a button for unassigning if isViewOnly is false', async () => {
        const element = wrapper.findDataTest(`unassign_${mockTeamEntity().id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('does not contain a button for unassigning if isViewOnly is true', async () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            assignedTeams: [mockTeamEntity()],
            assignedIndividuals: [mockIndividual],
            isViewOnly: true,
          },
        });
        const element = wrapper.findDataTest(`unassign_${mockTeamEntity().id}`);
        expect(element.exists()).toBeFalsy();
      });

      it('emits removeTeam when the unassign button is clicked', async () => {
        const element = wrapper.findDataTest(`unassign_${mockTeamEntity().id}`);
        await element.trigger('click');
        expect(wrapper.emitted('removeTeam')).toBeTruthy();
      });
    });

    describe('assigned individuals list', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('assigned-individuals-list');
        expect(element.exists()).toBeTruthy();
      });

      it('contains assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-individuals-list-item-${mockIndividual.entity.id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('displays name of assigned teams', () => {
        const element = wrapper.findDataTest(`assigned-individuals-list-item-${mockIndividual.entity.id}`);
        expect(element.text()).toContain(mockIndividual.metadata.displayName);
      });

      it('contains a button for unassigning', () => {
        const element = wrapper.findDataTest(`unassign_${mockIndividual.entity.id}`);
        expect(element.exists()).toBeTruthy();
      });

      it('does not contain a button for unassigning if isViewOnly is true', async () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            assignedTeams: [mockTeamEntity()],
            assignedIndividuals: [mockIndividual],
            isViewOnly: true,
          },
        });
        const element = wrapper.findDataTest(`unassign_${mockTeamEntity().id}`);
        expect(element.exists()).toBeFalsy();
      });

      it('emits removeIndividual when the unassign button is clicked', async () => {
        const element = wrapper.findDataTest(`unassign_${mockIndividual.entity.id}`);
        await element.trigger('click');
        expect(wrapper.emitted('removeIndividual')).toBeTruthy();
      });
    });
  });
});
