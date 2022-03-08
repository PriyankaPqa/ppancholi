import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import {
  OptionItem,
  mockOptionItemData,
} from '@/entities/optionItem';
import {
  mockCombinedEvents, mockEventEntity, mockRegionData, mockOtherProvinceData,
} from '@/entities/event';
import { mockStorage } from '@/store/storage';
import Component from '../CreateEditEvent.vue';

const localVue = createLocalVue();

describe('CreatEditEvent.vue', () => {
  let wrapper;

  const mockEvent = mockEventEntity();
  const storage = mockStorage();
  storage.event.actions.fetchEventTypes = jest.fn(() => mockOptionItemData());
  storage.event.actions.fetchAll = jest.fn(() => mockCombinedEvents());
  storage.event.actions.fetchOtherProvinces = jest.fn(() => mockOtherProvinceData());
  storage.event.actions.createEvent = jest.fn(() => mockEvent);
  storage.event.actions.updateEvent = jest.fn(() => mockEvent);
  storage.event.actions.fetchRegions = jest.fn(() => mockRegionData());
  storage.event.getters.eventTypes = jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e)));

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue: createLocalVue(),
        mocks: {
          $storage: storage,
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
        expect(wrapper.vm.$storage.event.actions.createEvent).toHaveBeenCalledTimes(0);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(wrapper.vm.$storage.event.actions.createEvent).toHaveBeenCalledTimes(1);
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

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '',
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('isEditMode', () => {
      it('returns true if the route is the edit event route', () => {
        expect(wrapper.vm.isEditMode).toBe(false);

        const wrapper2 = shallowMount(Component, {
          localVue,
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
            $storage: storage,
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
            $storage: storage,
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
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
            $storage: storage,
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
          mocks: {
            $route: {
              name: routes.events.edit.name,
            },
            $storage: storage,
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
        mocks: {
          $route: {
            name: routes.events.edit.name,
          },
          $storage: storage,
        },
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

      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          id: mockEvent.id,
        },
        stubs: {
          EventForm: true,
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
          },
          $storage: storage,
        },
        computed: {
          isEditMode() {
            return true;
          },
        },
      });
    });

    it('calls the fetch action on created', async () => {
      expect(wrapper.vm.$storage.event.actions.fetch).toHaveBeenCalledWith(
        mockEvent.id,
      );
    });

    it('submit calls the updateEvent action if in edit mode', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);

      await wrapper.vm.submit();
      expect(wrapper.vm.$storage.event.actions.updateEvent).toHaveBeenCalledTimes(1);
    });

    it('shows a toast notification after saving the updated event', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);

      await wrapper.vm.submit();
      expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event_edit.success');
    });

    test('after submitting, the user is redirected to the event details page', async () => {
      wrapper.vm.$refs.form.validate = jest.fn(() => true);
      await wrapper.setData({ event: mockEvent });
      jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation(() => {});

      await wrapper.vm.submit();

      expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
        { name: routes.events.summary.name, params: { id: mockEvent.id } },
      );
    });
  });
});
