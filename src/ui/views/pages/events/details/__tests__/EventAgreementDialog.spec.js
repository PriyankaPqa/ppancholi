import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData } from '@/entities/event';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import entityUtils from '@/entities/utils';
import { mockOptionItemData } from '@/entities/optionItem';

import Component from '../components/EventAgreementDialog.vue';

const localVue = createLocalVue();
const mockEvent = new Event(mockEventsSearchData()[0]);
const storage = mockStorage();

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
          agreementTypes: [],
        },
        computed: {
          dayAfterStartDate() {
            return '2020-01-02';
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
        // eslint-disable-next-line prefer-destructuring
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
        // eslint-disable-next-line prefer-destructuring
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

      it('calls checkNameUniqueness when it is changed', () => {
        jest.spyOn(wrapper.vm, 'checkNameUniqueness').mockImplementation(() => {});
        element.vm.$emit('input', 'foo');
        expect(wrapper.vm.checkNameUniqueness).toHaveBeenCalledTimes(1);
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
          agreementTypes: [],
        },
      });
    });

    describe('dayAfterStartDate', () => {
      it('returns the right date', () => {
        wrapper.vm.agreement.startDate = '2020-01-01';
        expect(wrapper.vm.dayAfterStartDate).toEqual('2020-01-02');
      });
    });

    describe('endDateRule', () => {
      it('returns the right object if the agreement has a start and end date', async () => {
        wrapper.vm.agreement.endDate = '2021-03-20';
        wrapper.vm.agreement.startDate = '2021-03-01';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.endDateRule).toEqual({
          mustBeAfterOrSame: { X: '2021-03-20', Y: '2021-03-02' },
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
            agreementTypes: [],
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
            agreementTypes: [],
          },
        });
        expect(wrapper.vm.title).toEqual('eventSummary.addAgreement');
      });
    });
  });

  describe('Life cycle', () => {
    describe('edit mode', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.agreements[0].name.translation.en,
            agreementTypes: mockOptionItemData(),
          },
        });
      });

      it('sets the right agreement data', () => {
        const agreement = mockEvent.agreements[0];
        expect(wrapper.vm.agreement).toEqual({
          name: {
            translation: {
              en: 'agreement 1',
              fr: 'agreement 1 fr',
            },
          },
          startDate: '2021-03-01',
          endDate: null,
          agreementType: {
            optionItemId: '1',
            specifiedOther: '',
          },
          agreementTypeName: {
            translation: {
              en: 'agreement type 1',
              fr: 'agreement type 1 fr',
            },
          },
          details: {
            translation: {
              en: 'agreement 1 details',
              fr: 'agreement 1  details fr',
            },
          },
        });

        expect(wrapper.vm.originalAgreement).toEqual(agreement);
      });

      it('sets the right agreement type', () => {
        expect(wrapper.vm.agreementType).toEqual(mockOptionItemData()[0]);
      });
    });

    describe('add mode', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            agreementTypes: mockOptionItemData(),
          },
        });
      });

      it('sets the right agreement data', () => {
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

      it('sets the right default agreement type', () => {
        expect(wrapper.vm.agreementType).toEqual(mockOptionItemData()[1]); // isDefault: true
      });
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
          agreementTypes: [],
        },
      });
    });
    describe('checkNameUniqueness', () => {
      it('sets isNameUnique to true if the name is not used in other agreements', async () => {
        await wrapper.vm.checkNameUniqueness('foo');
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });

      it('sets isNameUnique to false if the name is used in other agreements', async () => {
        await wrapper.vm.checkNameUniqueness(mockEvent.agreements[0].name.translation.fr);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
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

      describe('edit mode', () => {
        storage.event.actions.editAgreement = jest.fn(() => {});
        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
              isEditMode: true,
              id: mockEvent.agreements[0].name.translation.en,
              agreementTypes: [],
            },
            mocks: {
              $storage: storage,
            },
          });
        });

        it('does not call storage action editAgreement if validate is false', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.editAgreement).toHaveBeenCalledTimes(0);
        });

        it('calls storage action editAgreement with the right payload', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          wrapper.vm.agreement = { ...wrapper.vm.event.agreements[0], startDate: '2020-01-01', endDate: null };

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.editAgreement).toHaveBeenCalledWith({
            eventId: wrapper.vm.event.id,
            payload: {
              originalAgreement: wrapper.vm.event.agreements[0],
              updatedAgreement: { ...wrapper.vm.event.agreements[0], startDate: '2020-01-01' },
            },
          });
        });
      });

      describe('add mode', () => {
        storage.event.actions.addAgreement = jest.fn(() => {});
        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
              isEditMode: false,
              agreementTypes: [],
            },
            mocks: {
              $storage: storage,
            },
          });
        });

        it('does not call storage action addAgreement if validate is false', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.addAgreement).toHaveBeenCalledTimes(0);
        });

        it('calls storage action addAgreement with the right payload', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          wrapper.vm.agreement = { ...wrapper.vm.event.agreements[0], startDate: '2020-01-01', endDate: null };

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.addAgreement).toHaveBeenCalledWith({
            eventId: wrapper.vm.event.id,
            payload: { ...wrapper.vm.event.agreements[0], startDate: '2020-01-01' },
          });
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
  });
});
