import { createLocalVue, mount } from '@/test/testSetup';
import Component from './TeamMembersTable.vue';

const localVue = createLocalVue();

describe('TeamMembersTable.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      propsData: {
        teamMembers: [],
        isEditMode: false,
      },
    });
  });

  describe('Template', () => {
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
      test('when the button is clicked, it calls the method openDialog', async () => {
        jest.spyOn(wrapper.vm, 'openDialog').mockImplementation(() => {});
        wrapper.setProps({ isEditMode: true });
        await wrapper.vm.$nextTick();
        const button = wrapper.find('[data-test="add-new-member"]');
        await button.trigger('click');
        expect(wrapper.vm.openDialog).toBeCalledTimes(1);
      });
    });
  });
});
