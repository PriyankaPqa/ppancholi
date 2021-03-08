import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { Event, mockEventsData } from '@/entities/event';
import Component from '../CreateEditEvent.vue';

describe('CreatEditEvent.vue', () => {
  let wrapper;
  let actions;

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      actions = {
        createEvent: jest.fn(() => new Event(mockEventsData()[0])),
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
        propsData: {
          id: '',
        },
        computed: {
          isEditMode() {
            return false;
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

    describe('handleSubmitError', () => {
      it('sets isNameUnique to false if this is the error in its argument', async () => {
        await wrapper.vm.handleSubmitError(['An event with this name already exists.']);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });

      it(' opens an error toast in case of a different error', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        await wrapper.vm.handleSubmitError('foo');

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('error.unexpected_error');
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
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation(() => {});
        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
          { name: routes.events.details.name, params: { id: mockEventsData()[0].id } },
        );
      });

      test('after creating an event a toast notification is shown', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
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
      it('returns the correct value in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          computed: {
            isEditMode() {
              return false;
            },
          },
        });
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.createEvent');
      });

      it('returns the correct value in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          computed: {
            isEditMode() {
              return true;
            },
          },
        });
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.editEvent');
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

  describe('Edit mode', () => {
    let wrapper;

    beforeEach(() => {
      jest.clearAllMocks();

      actions = {
        fetchEvent: jest.fn(() => new Event(mockEventsData()[1])),
        updateEvent: jest.fn(),
      };

      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          id: mockEventsData()[1].id,
        },
        store: {
          modules: {
            event: {
              actions,
            },
          },
        },
        stubs: {
          EventForm: true,
        },
        computed: {
          isEditMode() {
            return true;
          },
        },
      });
    });

    it('calls the fetchEvent action on created', async () => {
      expect(actions.fetchEvent).toHaveBeenCalledWith(
        expect.anything(),
        mockEventsData()[1].id,
      );
    });

    it('submit calls the updateEvent action if in edit mode', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);

      await wrapper.vm.submit();
      expect(actions.updateEvent).toHaveBeenCalledTimes(1);
    });

    it('shows a toast notification after saving the updated event', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);

      await wrapper.vm.submit();
      expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event_edit.success');
    });

    test('after submitting, the user is redirected to the event details page', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);
      jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation(() => {});

      await wrapper.vm.submit();

      expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
        { name: routes.events.details.name, params: { id: mockEventsData()[1].id } },
      );
    });
  });
});
