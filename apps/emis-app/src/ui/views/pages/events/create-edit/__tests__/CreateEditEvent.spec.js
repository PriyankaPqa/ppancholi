import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import {
  OptionItem,
  mockOptionItemData,
} from '@libs/entities-lib/optionItem';
import {
  mockCombinedEvents, mockEventEntity, mockRegionData, mockOtherProvinceData,
} from '@libs/entities-lib/event';
import { mockStorage } from '@/storage';
import helpers from '@/ui/helpers/helpers';
import Component from '../CreateEditEvent.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CreatEditEvent.vue', () => {
  let wrapper;

  const mockEvent = mockEventEntity();

  storage.event.actions.fetchEventTypes = jest.fn(() => mockOptionItemData());
  storage.event.actions.fetchAll = jest.fn(() => mockCombinedEvents());
  storage.event.actions.fetchOtherProvinces = jest.fn(() => mockOtherProvinceData());
  storage.event.actions.createEvent = jest.fn(() => mockEvent);
  storage.event.actions.updateEvent = jest.fn(() => mockEvent);
  storage.event.actions.fetchRegions = jest.fn(() => mockRegionData());
  storage.event.getters.eventTypes = jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e)));

  const doMount = (shallow = true, editMode) => {
    const options = {
      localVue,
      propsData: {
        id: '',
      },
      computed: {
        isEditMode() {
          return editMode;
        },
      },
      mocks: {
        $storage: storage,
        $route: {
          name: routes.events.edit.name,
        },
      },
    };
    if (shallow) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Methods', () => {
    describe('back', () => {
      describe('createMode', () => {
        it('calls the router replace method with the events home page', () => {
          doMount(true, false);
          wrapper.vm.back();
          expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
            name: routes.events.home.name,
          });
        });
      });

      describe('editMode', () => {
        it('calls the router replace method with the events detail page if edit mode is true', () => {
          doMount(true, true);
          wrapper.vm.back();
          expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
            name: routes.events.summary.name,
            params: {
              id: '',
            },
          });
        });
      });
    });

    describe('submit', () => {
      it('should call scrollToFirstError and return if the form is not valid', async () => {
        doMount(true, true);
        helpers.scrollToFirstError = jest.fn();
        wrapper.vm.submitEdit = jest.fn();
        wrapper.vm.submitCreate = jest.fn();

        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.submit();

        expect(helpers.scrollToFirstError).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.submitCreate).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.submitEdit).toHaveBeenCalledTimes(0);
      });

      it('should call submitEdit if edit mode', async () => {
        doMount(true, true);
        wrapper.vm.submitEdit = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.submitEdit).toHaveBeenCalledTimes(1);
      });

      it('should call submitCreate if create mode', async () => {
        doMount(true, false);
        wrapper.vm.submitCreate = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.submitCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitEdit', () => {
      it('should call updateEvent', async () => {
        doMount(true, true);
        await wrapper.vm.submitEdit();
        expect(wrapper.vm.$storage.event.actions.updateEvent).toBeCalled();
      });

      it('should redirect to details page in case of success', async () => {
        doMount(true, true);
        await wrapper.vm.submitEdit();
        expect(wrapper.vm.$router.replace).toBeCalledWith({ name: routes.events.summary.name, params: { id: wrapper.vm.event.id } });
      });
    });

    describe('submitCreate', () => {
      it('should call createEvent', async () => {
        doMount(true, false);
        await wrapper.vm.submitCreate();
        expect(wrapper.vm.$storage.event.actions.createEvent).toBeCalled();
      });

      it('should redirect to details page in case of success', async () => {
        doMount(true, false);
        await wrapper.vm.submitCreate();
        expect(wrapper.vm.$router.replace).toBeCalledWith({ name: routes.events.summary.name, params: { id: wrapper.vm.event.id } });
      });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is the edit event route', () => {
        doMount(true, true);
        expect(wrapper.vm.isEditMode).toBe(true);
      });
    });

    describe('submitLabel', () => {
      it('returns the correct value depending on edit mode', () => {
        doMount(true, false);
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');

        doMount(true, true);
        expect(wrapper.vm.submitLabel).toBe('common.save');
      });
    });

    describe('helpLink', () => {
      it('returns the correct value in create mode', () => {
        doMount(true, false);
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.createEvent');
      });

      it('returns the correct value in edit mode', () => {
        doMount(true, true);
        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.editEvent');
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      doMount(false, false);
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

  describe('Created', () => {
    doMount(true, true);
    it('calls the fetch action on created', async () => {
      expect(wrapper.vm.$storage.event.actions.fetch).toHaveBeenCalledWith('');
    });
  });
});
