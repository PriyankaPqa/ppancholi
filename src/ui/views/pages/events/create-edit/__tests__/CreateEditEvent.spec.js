import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { Event, mockEventsSearchData } from '@/entities/event';
import Component from '../CreateEditEvent.vue';

const localVue = createLocalVue();

describe('CreatEditEvent.vue', () => {
  let wrapper;
  let actions;
  let mockEvent;

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      mockEvent = new Event(mockEventsSearchData()[0]);

      actions = {
        createEvent: jest.fn(() => mockEvent),
        update: jest.fn(() => mockEvent),
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

      it('calls the router replace method with the events detail page if edit mode is true', () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          store: {
            modules: {
              event: {
                actions: {
                  fetchEvent: jest.fn(() => mockEvent),
                },
              },
            },
          },
          propsData: {
            id: 'TEST_ID',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
        });

        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.summary.name,
          params: {
            id: 'TEST_ID',
          },
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
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation(() => {});
        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
          { name: routes.events.summary.name, params: { id: mockEvent.id } },
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
      jest.clearAllMocks();

      mockEvent = new Event(mockEventsSearchData()[0]);

      actions = {
        createEvent: jest.fn(() => mockEvent),
        update: jest.fn(() => mockEvent),
        fetchEvent: jest.fn(() => mockEvent),
      };

      wrapper = shallowMount(Component, {
        localVue,
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
      });
    });

    describe('isEditMode', () => {
      it('returns true if the route is the edit event route', () => {
        expect(wrapper.vm.isEditMode).toBe(false);

        const wrapper2 = shallowMount(Component, {
          localVue,
          store: {
            modules: {
              event: {
                actions,
              },
            },
          },
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
          },
          propsData: {
            id: '',
          },
        });

        expect(wrapper2.vm.isEditMode).toBe(true);
      });
    });

    describe('submitLabel', () => {
      it('returns the correct value depending on edit mode', () => {
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');

        const wrapper2 = shallowMount(Component, {
          localVue,
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
          },
          store: {
            modules: {
              event: {
                actions,
              },
            },
          },
        });

        expect(wrapper2.vm.submitLabel).toBe('common.save');
      });
    });

    describe('helpLink', () => {
      it('returns the correct value in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            isEditMode() {
              return false;
            },
          },
          store: {
            modules: {
              event: {
                actions,
              },
            },
          },
        });
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.createEvent');
      });

      it('returns the correct value in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            isEditMode() {
              return true;
            },
          },
          store: {
            modules: {
              event: {
                actions,
              },
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
        await wrapper.setData({
          isDirty: true, // force dirty state to enable button
        });
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

        await wrapper.vm.submit();

        expect(button.attributes('disabled')).toBe('disabled');
      });
    });
  });

  describe('Edit mode', () => {
    let wrapper;

    beforeEach(() => {
      jest.clearAllMocks();

      mockEvent = new Event(mockEventsSearchData()[0]);

      actions = {
        fetchEvent: jest.fn(() => mockEvent),
        updateEvent: jest.fn(() => mockEvent),
      };

      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          id: mockEvent.id,
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
        mockEvent.id,
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
        { name: routes.events.summary.name, params: { id: mockEvent.id } },
      );
    });
  });
});
