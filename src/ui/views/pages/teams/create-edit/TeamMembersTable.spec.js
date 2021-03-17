import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockTeamMembersSearchData } from '@/entities/team';
import AddTeamMembers from '@/ui/views/pages/teams/add-team-members/AddTeamMembers.vue';
import Component from './TeamMembersTable.vue';

const localVue = createLocalVue();

describe('TeamMembersTable.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          teamMembers: mockTeamMembersSearchData(),
          isEditMode: false,
        },
      });
    });

    describe('Rendered elements', () => {
      it('shows an Add New Member button', () => {
        const button = wrapper.find('[data-test="add-new-member"]');
        expect(button.exists()).toBeTruthy();
      });

      it('should display Add New Member button as disabled when in edit mode ', () => {
        wrapper.setProps({ isEditMode: true });
        const button = wrapper.find('[data-test="add-new-member"]');
        expect(button.attributes('disabled')).toBeTruthy();
      });

      describe('Members data table', () => {
        it('is not rendered  when in create mode', async () => {
          wrapper.setProps({ isEditMode: false });
          await wrapper.vm.$nextTick();
          const table = wrapper.findDataTest('teamMembers__table');
          expect(table.exists()).toBeFalsy();
        });

        it('is rendered when in edit mode', async () => {
          wrapper.setProps({ isEditMode: true });
          await wrapper.vm.$nextTick();
          const table = wrapper.findDataTest('teamMembers__table');
          expect(table.exists()).toBeTruthy();
        });

        it('displays the correct header values when in edit mode', async () => {
          wrapper.setProps({ isEditMode: true });
          await wrapper.vm.$nextTick();

          const headers = wrapper.findAll('th');

          expect(headers.length).toBe(8);

          expect(headers.wrappers[0].find('span').text()).toBe('teams.member_name');
          expect(headers.wrappers[1].find('span').text()).toBe('teams.member_email');
          expect(headers.wrappers[2].find('span').text()).toBe('teams.phone_number');
          expect(headers.wrappers[3].find('span').text()).toBe('teams.member_role');
          expect(headers.wrappers[4].find('span').text()).toBe('teams.teams');
          expect(headers.wrappers[5].find('span').text()).toBe('teams.count_file.total');
          expect(headers.wrappers[6].find('span').text()).toBe('teams.count_file.open');
          expect(headers.wrappers[7].find('span').text()).toBe('teams.count_file.inactive');
        });

        test('items props is linked to computedTeamMembers', async () => {
          wrapper.setProps({ isEditMode: true });
          await wrapper.vm.$nextTick();

          const element = wrapper.findDataTest('teamMembers__table');
          expect(element.props().items).toEqual(wrapper.vm.computedTeamMembers);
        });
      });

      describe('Add Team Members', () => {
        it('is shown only if showAddTeamMemberDialog is true', async () => {
          expect(wrapper.findComponent(AddTeamMembers).exists()).toBeFalsy();

          await wrapper.setData({ showAddTeamMemberDialog: true });

          expect(wrapper.findComponent(AddTeamMembers).exists()).toBeTruthy();
        });

        it('it relays refresh-team event', async () => {
          await wrapper.setData({ showAddTeamMemberDialog: true });
          const element = wrapper.findDataTest('add-team-members');

          element.vm.$emit('refresh-team');

          expect(wrapper.emitted('refresh-team')).toBeTruthy();
        });

        test('props teamMembers is correctly linked', async () => {
          await wrapper.setData({ showAddTeamMemberDialog: true });
          const element = wrapper.findDataTest('add-team-members');
          expect(element.props().teamMembers).toEqual(wrapper.vm.teamMembers);
        });
      });

      describe('Search input', () => {
        it('should only be displayed on edit mode', async () => {
          await wrapper.setProps({ isEditMode: false });
          expect(wrapper.findDataTest('search').exists()).toBeFalsy();

          await wrapper.setProps({ isEditMode: true });
          expect(wrapper.findDataTest('search').exists()).toBeTruthy();
        });
      });
    });

    describe('Event Handlers', () => {
      test('when the button is clicked the dialog is add team member dialog is shown', async () => {
        wrapper.setProps({ isEditMode: true });
        await wrapper.vm.$nextTick();
        const button = wrapper.find('[data-test="add-new-member"]');
        await button.trigger('click');
        expect(wrapper.vm.showAddTeamMemberDialog).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamMembers: mockTeamMembersSearchData(),
          isEditMode: false,
        },
        data() {
          return {
            search: 'Alex',
            sortBy: 'displayName',
          };
        },
      });
    });

    describe('computedTeamMembers', () => {
      it('returns filtered list', () => {
        expect(wrapper.vm.computedTeamMembers).toEqual([wrapper.vm.teamMembers[0]]);
      });
    });

    describe('teamMembersId', () => {
      it('returns the list of team members id', () => {
        expect(wrapper.vm.teamMembersId).toEqual(wrapper.vm.teamMembers.map((m) => m.id));
      });
    });
  });
});
