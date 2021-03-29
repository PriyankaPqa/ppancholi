import { VSwitch } from 'vuetify/lib';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData, EEventCallCentreStatus } from '@/entities/event';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import entityUtils from '@/entities/utils';

import Component from '../components/EventCallCentreDialog.vue';

const localVue = createLocalVue();
const mockEvent = new Event(mockEventsSearchData()[0]);
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
          statusName() { return 'eventSummary.status.Active'; },
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

      it('calls checkNameUniqueness when it is changed', () => {
        jest.spyOn(wrapper.vm, 'checkNameUniqueness').mockImplementation(() => {});
        element.vm.$emit('input', 'foo');
        expect(wrapper.vm.checkNameUniqueness).toHaveBeenCalledTimes(1);
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
    describe('edit mode', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.callCentres[0].name.translation.en,
          },
        });
      });

      it('sets the right call centre data', () => {
        const callCentre = mockEvent.callCentres[0];
        expect(wrapper.vm.callCentre).toEqual({
          name: {
            translation: {
              en: 'z call center 1',
              fr: 'call center 1 fr',
            },
          },
          startDate: '2021-03-01',
          endDate: null,
          status: EEventCallCentreStatus.Active,
          details: {
            translation: {
              en: 'call center 1 details',
              fr: 'call center 1  details fr',
            },
          },
        });

        expect(wrapper.vm.originalCallCentre).toEqual(callCentre);

        expect(wrapper.vm.isActive).toBeTruthy();
      });
    });

    describe('add mode', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
          },
        });
      });

      it('sets the right call centre data', () => {
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
      });
    });
    describe('checkNameUniqueness', () => {
      it('sets isNameUnique to true if the name is not used in other call centres', async () => {
        await wrapper.vm.checkNameUniqueness('foo');
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });

      it('sets isNameUnique to false if the name is used in other call centres', async () => {
        await wrapper.vm.checkNameUniqueness(mockEvent.callCentres[0].name.translation.fr);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to callCentre name', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.callCentre.name).toEqual({ translation: { en: 'mock-name-en' } });
      });

      it('calls entityUtils.getFilledMultilingualField and assigns the result to callCentre details', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-details-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.callCentre.details).toEqual({ translation: { en: 'mock-details-en' } });
      });
    });

    describe('makePayload', () => {
      it('calls fillEmptyMultilingualFields', async () => {
        jest.spyOn(wrapper.vm, 'fillEmptyMultilingualFields').mockImplementation(() => {});
        await wrapper.vm.makePayload();
        expect(wrapper.vm.fillEmptyMultilingualFields).toHaveBeenCalledTimes(1);
      });

      it('sets the start date to ISO String format if the date is not null', async () => {
        wrapper.vm.callCentre.startDate = '2021-01-01';
        await wrapper.vm.makePayload();
        expect(wrapper.vm.callCentre.startDate).toEqual(new Date('2021-01-01').toISOString());
      });
      it('sets the start date to null if the date is null', async () => {
        wrapper.vm.callCentre.startDate = null;
        await wrapper.vm.makePayload();
        expect(wrapper.vm.callCentre.startDate).toBeNull();
      });

      it('sets the end date to ISO String format if the date is not null', async () => {
        wrapper.vm.callCentre.endDate = '2021-01-02';
        await wrapper.vm.makePayload();
        expect(wrapper.vm.callCentre.endDate).toEqual(new Date('2021-01-02').toISOString());
      });

      it('sets the end date to null if the date is null', async () => {
        wrapper.vm.callCentre.endDate = null;
        await wrapper.vm.makePayload();
        expect(wrapper.vm.callCentre.endDate).toBeNull();
      });
    });

    describe('onSubmit', () => {
      it('calls makePayload only if isValid is true', async () => {
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.makePayload).toHaveBeenCalledTimes(1);
      });

      it('does not call makePayload  if isValid is false', async () => {
        jest.spyOn(wrapper.vm, 'makePayload').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.makePayload).toHaveBeenCalledTimes(0);
      });

      describe('edit mode', () => {
        storage.event.actions.editCallCentre = jest.fn(() => {});
        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
              isEditMode: true,
              id: mockEvent.callCentres[0].name.translation.en,
            },
            mocks: {
              $storage: storage,
            },
          });
        });

        it('does not call storage action editCallCentre if validate is false', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.editCallCentre).toHaveBeenCalledTimes(0);
        });

        it('calls storage action editCallCentre with the right payload', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          wrapper.vm.callCentre = { ...wrapper.vm.event.callCentres[0], startDate: null, endDate: null };

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.editCallCentre).toHaveBeenCalledWith({
            eventId: wrapper.vm.event.id,
            payload: {
              originalCallCentre: wrapper.vm.event.callCentres[0],
              updatedCallCentre: wrapper.vm.callCentre,
            },
          });
        });
      });

      describe('add mode', () => {
        storage.event.actions.addCallCentre = jest.fn(() => {});
        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              event: mockEvent,
              isEditMode: false,
            },
            mocks: {
              $storage: storage,
            },
          });
        });

        it('does not call storage action addCallCentre if validate is false', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.addCallCentre).toHaveBeenCalledTimes(0);
        });

        it('calls storage action addCallCentre with the right payload', async () => {
          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          wrapper.vm.callCentre = { ...wrapper.vm.event.callCentres[0], startDate: null, endDate: null };

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.event.actions.addCallCentre).toHaveBeenCalledWith({
            eventId: wrapper.vm.event.id,
            payload: wrapper.vm.callCentre,
          });
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
