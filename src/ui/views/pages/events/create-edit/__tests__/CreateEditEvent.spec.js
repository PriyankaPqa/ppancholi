import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import Component from '../CreateEditEvent.vue';

describe('CreatEditEvent.vue', () => {
  let wrapper;
  let actions;

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      actions = {
        createEvent: jest.fn(),
      };

      wrapper = mount(Component, {
        localVue: createLocalVue(),
        store: {
          modules: {
            event: {
              actions,
            },
          },
        },
      });
    });

    describe('back', () => {
      it('calls the router replace method with the events home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.home.name,
        });
      });
    });

    describe('submit', () => {
      it('does not call createEvent unless form validation succeeds', async () => {
        await wrapper.vm.submit();
        expect(actions.createEvent).toHaveBeenCalledTimes(0);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(actions.createEvent).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the event details page', async () => {
        // TODO after implementing view event details
        expect(true).toBeTruthy();
      });

      test('after creating an event a toast notification is shown', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event_create.success');
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
      });
    });

    describe('isEditMode', () => {
      it('returns true if the route is the edit event route', () => {
        expect(wrapper.vm.isEditMode).toBe(false);

        const wrapper2 = shallowMount(Component, {
          localVue: createLocalVue(),
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
          },
        });

        expect(wrapper2.vm.isEditMode).toBe(true);
      });
    });

    describe('submitLabel', () => {
      it('returns the correct value depending on edit mode', () => {
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');

        const wrapper2 = shallowMount(Component, {
          localVue: createLocalVue(),
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
          },
        });

        expect(wrapper2.vm.submitLabel).toBe('common.save');
      });
    });

    describe('helpLink', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.createEvent');
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
      });
    });

    describe('Event handlers', () => {
      test('the save button calls the submit method', async () => {
        jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => {});
        const button = wrapper.findDataTest('save');
        await button.trigger('click');

        expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
      });

      test('the cancel button calls the back method', async () => {
        jest.spyOn(wrapper.vm, 'back').mockImplementation(() => {});
        const button = wrapper.findDataTest('cancel');
        await button.trigger('click');

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });
    });

    describe('Validation', () => {
      test('the save button is disabled if validation fails', async () => {
        const button = wrapper.findDataTest('save');

        expect(button.attributes('disabled')).toBeFalsy();

        await wrapper.vm.submit();

        expect(button.attributes('disabled')).toBe('disabled');
      });
    });
  });
});
