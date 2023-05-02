import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import entityUtils from '@libs/entities-lib/utils';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { EEventSummarySections } from '@/types';

import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from '../components/EventAgreementDialog.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();

describe('EventAgreementDialog.vue', () => {
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
          dayAfterStartDate() {
            return '2020-01-02';
          },
          agreementTypes() {
            return mockOptionItemData();
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
                max: MAX_LENGTH_LG,
              },
              agreementType: {
                required: true,
              },
              agreementTypeOther: {
                required: true,
                max: MAX_LENGTH_MD,
              },
            };
          },
        },
      });
    });

    describe('agreement type', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('agreement-agreementType');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.agreement.agreementType*');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.agreementType);
      });

      it('calls setAgreementType when it is changed', () => {
        jest.spyOn(wrapper.vm, 'setAgreementType').mockImplementation(() => {});
        element.vm.$emit('change');
        expect(wrapper.vm.setAgreementType).toHaveBeenCalledTimes(1);
      });
    });

    describe('specify other', () => {
      let element;
      beforeEach(async () => {
        wrapper.vm.agreementType = mockOptionItemData()[0]; // isOther : true
        await wrapper.vm.$nextTick();
        element = wrapper.findDataTest('agreement-type-specifiedOther');
      });

      it('should render if agreement type is other', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('common.pleaseSpecify*');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.agreementTypeOther);
      });

      it('should not render if event type is not other', async () => {
        wrapper.vm.agreementType = mockOptionItemData()[1]; // isOther : false
        await wrapper.vm.$nextTick();
        element = wrapper.findDataTest('agreement-type-specifiedOther');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('name field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('agreement-name');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.agreement.name*');
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

    describe('start date field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('agreement-start-date');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.agreement.startDate');
      });
    });

    describe('end date field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('agreement-end-date');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.agreement.endDate');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.endDate);
      });
    });

    describe('details field', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('agreement-details');
      });

      it('should render', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should display the correct label', () => {
        const label = element.find('label');
        expect(label.text()).toEqual('eventSummary.agreement.details');
      });

      it('is linked to the right rule attribute', () => {
        expect(element.props('rules')).toEqual(wrapper.vm.rules.details);
      });

      test('clear button calls clearDetails', async () => {
        jest.spyOn(wrapper.vm, 'clearDetails').mockImplementation(() => {});
        await element.vm.$emit('click:clear');
        expect(wrapper.vm.clearDetails).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    const { pinia, eventStore } = useMockEventStore();

    eventStore.getAgreementTypes = jest.fn(() => mockOptionItemData());

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: '',
        },

      });
    });

    describe('agreementTypes', () => {
      it('calls the getter with the current agreement type id if in edit more', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: '',
          },
          data() {
            return {
              agreement: mockEvent.agreements[0],
            };
          },

        });

        expect(eventStore.getAgreementTypes).toHaveBeenCalledWith(true, wrapper.vm.agreement.agreementType.optionItemId);
      });

      it('calls the getter without the current agreement type id if not in edit more', () => {
        expect(eventStore.getAgreementTypes).toHaveBeenCalledWith(true, null);
      });
    });

    describe('endDateRule', () => {
      it('returns the right object if the agreement has a start and end date', async () => {
        wrapper.vm.agreement.endDate = '2021-03-20';
        wrapper.vm.agreement.startDate = '2021-03-01';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.endDateRule).toEqual({
          mustBeAfterOrSame: { X: '2021-03-20', Y: '2021-03-01' },
        });
      });

      it('returns an empty object if the agreement does not have  a start or end date', async () => {
        wrapper.vm.agreement.endDate = null;
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
          agreementType: {
            required: true,
          },
          agreementTypeOther: {
            required: true,
            max: MAX_LENGTH_MD,
          },
        });
      });
    });

    describe('title', () => {
      it('returns the right value when agreement is in edit mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.agreements[0].name.translation.en,
          },
        });

        expect(wrapper.vm.title).toEqual('eventSummary.editAgreement');
      });

      it('returns the right value when agreement is in add mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
          },
        });
        expect(wrapper.vm.title).toEqual('eventSummary.addAgreement');
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
          id: mockEvent.agreements[0].id,
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
          id: mockEvent.agreements[0].id,
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
    const { pinia, eventStore } = useMockEventStore();

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          event: mockEvent,
          isEditMode: false,
        },
        computed: {
          agreementTypes() {
            return mockOptionItemData();
          },
        },

      });
    });

    describe('initCreateMode', () => {
      it('sets the right call centre data', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.agreement).toEqual({
          name: {
            translation: {
              en: '',
              fr: '',
            },
          },
          startDate: null,
          endDate: null,
          agreementType: { optionItemId: '2', specifiedOther: '' },
          agreementTypeName: {
            translation: {},
          },
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
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.agreements[0].id,
          },
          computed: {
            agreementTypes() {
              return mockOptionItemData();
            },
          },
        });
      });
      it('sets the right agreement data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.agreements[0].id,
          },
          computed: {
            agreementTypes() {
              return mockOptionItemData();
            },
          },
        });
        await wrapper.vm.initEditMode();
        expect(wrapper.vm.agreementType).toEqual(mockOptionItemData()[0]);
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to agreement name', async () => {
        const spy = jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.agreement.name).toEqual({ translation: { en: 'mock-name-en' } });
        spy.mockRestore();
      });

      it('calls entityUtils.getFilledMultilingualField and assigns the result to agreement details', async () => {
        const spy = jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-details-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.agreement.details).toEqual({ translation: { en: 'mock-details-en' } });
        spy.mockRestore();
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

      it('does not call submitAgreement if validate is false', async () => {
        jest.spyOn(wrapper.vm, 'submitAgreement').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitAgreement).toHaveBeenCalledTimes(0);
      });

      it('calls submitAgreement if validate is true', async () => {
        jest.spyOn(wrapper.vm, 'submitAgreement').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitAgreement).toHaveBeenCalledTimes(1);
      });

      it('calls handleSubmitError if there is an error', async () => {
        jest.spyOn(wrapper.vm, 'submitAgreement').mockImplementation(() => {
          throw new Error();
        });
        jest.spyOn(wrapper.vm, 'handleSubmitError').mockImplementation(() => { });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.handleSubmitError).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitAgreement', () => {
      it('calls the storage action updateEventSection with the right payload', async () => {
        await wrapper.vm.submitAgreement();

        expect(eventStore.updateEventSection).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: wrapper.vm.agreement,
          section: EEventSummarySections.Agreement,
          action: 'add',
        });
      });
    });

    describe('setAgreementType', () => {
      it('sets the agreement type to the right value', async () => {
        await wrapper.vm.setAgreementType(mockOptionItemData()[1]);
        expect(wrapper.vm.agreement.agreementType.optionItemId).toEqual(mockOptionItemData()[1].id);
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

    describe('clearDetails', () => {
      it('clears the field details', async () => {
        wrapper.setData({
          agreement: { details: { en: 'foo', fr: 'bar' } },
        });
        await wrapper.vm.clearDetails();
        expect(wrapper.vm.agreement.details).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });
  });
});
