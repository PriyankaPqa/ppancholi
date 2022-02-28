/**
 * @group ui/components/events
 */

import { VSwitch } from 'vuetify/lib';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import { mockEventEntity, EEventCallCentreStatus } from '@/entities/event';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import entityUtils from '@/entities/utils';
import { EEventSummarySections } from '@/types';

import Component from '../components/EventCallCentreDialog.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();
const storage = mockStorage();

describe('EventCallCentreDialog.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: '',
        },
        computed: {
          statusName() {
            return 'eventSummary.status.Active';
          },
          rules() {
            return {
              name: {
                required: true,
                max: MAX_LENGTH_MD,
                customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
              },
              endDate: {
                ...this.endDateRule,
              },
              details: {
                max: MAX_LENGTH_MD,
              },
            };
          },
        },
      });
    });

    describe('name field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('callCentre-name');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.callCentre.name*');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.name);
      });

      it('calls resetAsUnique when it is changed', () => {
        jest.spyOn(wrapper.vm, 'resetAsUnique').mockImplementation(() => {});
        element.vm.$emit('input', 'foo');
        expect(wrapper.vm.resetAsUnique).toHaveBeenCalledTimes(1);
      });
    });

    describe('call centre status', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('callCentre-status');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('callCentre-status');
        expect(element.text()).toEqual(wrapper.vm.statusName);
      });
    });

    describe('call centre status switch', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('callcentre-switch-status');
        expect(element.exists()).toBeTruthy();
      });

      it('calls updateStatus when it is changed', () => {
        jest.spyOn(wrapper.vm, 'updateStatus').mockImplementation(() => {});
        const element = wrapper.findComponent(VSwitch);
        element.vm.$emit('change');
        expect(wrapper.vm.updateStatus).toHaveBeenCalledTimes(1);
      });
    });

    describe('start date field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('callcentre-start-date');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.callCentre.startDate');
      });
    });

    describe('end date field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('callcentre-end-date');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.callCentre.endDate');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.endDate);
      });
    });

    describe('details field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('callcentre-details');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.callCentre.details');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.details);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: '',
        },
      });
    });
    describe('endDateRule', () => {
      it('returns the right object if the call centre has a start and end date', async () => {
        wrapper.vm.callCentre.endDate = '2021-03-20';
        wrapper.vm.callCentre.startDate = '2021-03-01';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.endDateRule).toEqual({
          mustBeAfterOrSame: { X: wrapper.vm.callCentre.endDate, Y: wrapper.vm.callCentre.startDate },
        });
      });

      it('returns an empty object if the call centre does not have  a start or end date', async () => {
        wrapper.vm.callCentre.endDate = null;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.endDateRule).toEqual({ });
      });
    });

    describe('rules', () => {
      it('returns the right object', () => {
        wrapper.vm.isNameUnique = false;
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
            customValidator: { isValid: false, messageKey: 'validations.alreadyExists' },
          },
          endDate: { ...wrapper.vm.endDateRule },
          details: {
            max: MAX_LENGTH_LG,
          },
        });
      });
    });

    describe('statusName', () => {
      it('returns the right value when call centre is active', () => {
        wrapper.vm.isActive = true;
        expect(wrapper.vm.statusName).toEqual('eventSummary.status.Active');
      });
      it('returns the right value when call centre is inactive', () => {
        wrapper.vm.isActive = false;
        expect(wrapper.vm.statusName).toEqual('eventSummary.status.Inactive');
      });
    });

    describe('title', () => {
      it('returns the right value when call centre is in edit mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.callCentres[0].name.translation.en,
          },
        });

        expect(wrapper.vm.title).toEqual('eventSummary.editCallCentre');
      });

      it('returns the right value when call centre is in add mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
          },
        });
        expect(wrapper.vm.title).toEqual('eventSummary.addCallCentre');
      });
    });
  });

  describe('Life cycle', () => {
    it('should call initCreateMode if isEditMode is false', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: mockEvent.callCentres[0].id,
        },
      });
      wrapper.vm.initCreateMode = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.initCreateMode).toHaveBeenCalledTimes(1);
    });

    it('should call initEditMode if isEditMode is true', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: true,
          id: mockEvent.callCentres[0].id,
        },
      });
      wrapper.vm.initEditMode = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.initEditMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: '',
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('initCreateMode', () => {
      it('sets the right call centre data', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.callCentre).toEqual({
          name: {
            translation: {
              en: '',
              fr: '',
            },
          },
          startDate: null,
          endDate: null,
          status: EEventCallCentreStatus.Inactive,
          details: {
            translation: {
              en: '',
              fr: '',
            },
          },
        });
      });
    });

    describe('initEditMode', () => {
      it('sets the right call centre data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.callCentres[0].id,
          },
        });
        await wrapper.vm.initEditMode();
        expect(wrapper.vm.callCentre).toMatchObject({ ...mockEvent.callCentres[0], startDate: helpers.getLocalStringDate('2021-03-01T00:00:00Z') });
        expect(wrapper.vm.isActive).toBeTruthy();
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to callCentre name', async () => {
        const spy = jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.callCentre.name).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });

      it('calls entityUtils.getFilledMultilingualField and assigns the result to callCentre details', async () => {
        const spy = jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-details-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.callCentre.details).toEqual({ translation: { en: 'mock-details-en' } });
        spy.mockRestore();
      });
    });

    describe('makePayload', () => {
      it('sets the start date to ISO String format if the date is not null', () => {
        wrapper.vm.callCentre.startDate = '2021-01-01';
        expect(wrapper.vm.makePayload(wrapper.vm.callCentre)).toEqual({
          ...wrapper.vm.callCentre,
          startDate: new Date('2021-01-01').toISOString(),
        });
      });
      it('sets the start date to null if the date is null', () => {
        wrapper.vm.callCentre.startDate = null;
        expect(wrapper.vm.makePayload(wrapper.vm.callCentre)).toEqual({
          ...wrapper.vm.callCentre,
          startDate: null,
        });
      });

      it('sets the end date to ISO String format if the date is not null', () => {
        wrapper.vm.callCentre.endDate = '2021-01-01';
        expect(wrapper.vm.makePayload(wrapper.vm.callCentre)).toEqual({
          ...wrapper.vm.callCentre,
          endDate: new Date('2021-01-01').toISOString(),
        });
      });

      it('sets the end date to null if the date is null', () => {
        wrapper.vm.callCentre.endDate = null;
        expect(wrapper.vm.makePayload(wrapper.vm.callCentre)).toEqual({
          ...wrapper.vm.callCentre,
          endDate: null,
        });
      });
    });

    describe('onSubmit', () => {
      it('calls fillEmptyMultilingualFields only if isValid is true', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(1);
      });

      it('does not call fillEmptyMultilingualFields  if isValid is false', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(0);
      });

      it('does not call submitCallCentre if validate is false', async () => {
        jest.spyOn(wrapper.vm, 'submitCallCentre').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitCallCentre).toHaveBeenCalledTimes(0);
      });

      it('calls submitCallCentre if validate is true', async () => {
        jest.spyOn(wrapper.vm, 'submitCallCentre').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitCallCentre).toHaveBeenCalledTimes(1);
      });

      it('calls handleSubmitError if there is an error', async () => {
        jest.spyOn(wrapper.vm, 'submitCallCentre').mockImplementation(() => {
          throw new Error();
        });
        jest.spyOn(wrapper.vm, 'handleSubmitError').mockImplementation(() => { });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.handleSubmitError).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitCallCentre', () => {
      it('calls the storage action updateEventSection with the right payload', async () => {
        wrapper.vm.callCentre = { ...mockEvent.callCentres[0], startDate: '2020-01-01', endDate: null };
        await wrapper.vm.submitCallCentre();

        expect(wrapper.vm.$storage.event.actions.updateEventSection).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: { ...mockEvent.callCentres[0], startDate: new Date('2020-01-01').toISOString() },
          section: EEventSummarySections.CallCentre,
          action: 'add',
        });
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode to the argument passed', async () => {
        await wrapper.vm.setLanguageMode('es');
        expect(wrapper.vm.languageMode).toEqual('es');
      });

      it('calls fillEmptyMultilingualFields', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        await wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateStatus', () => {
      it('sets the status of the call centre to active if the argument passed is true', async () => {
        wrapper.vm.callCentre.status = EEventCallCentreStatus.Inactive;
        await wrapper.vm.updateStatus(true);
        expect(wrapper.vm.callCentre.status).toEqual(EEventCallCentreStatus.Active);
      });

      it('sets the status of the call centre to inactive if the argument passed is false', async () => {
        wrapper.vm.callCentre.status = EEventCallCentreStatus.Active;
        await wrapper.vm.updateStatus(false);
        expect(wrapper.vm.callCentre.status).toEqual(EEventCallCentreStatus.Inactive);
      });
    });
  });
});
