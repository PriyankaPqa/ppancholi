import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity, EEventLocationStatus } from '@libs/entities-lib/event';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import entityUtils from '@libs/entities-lib/utils';
import helpers from '@/ui/helpers/helpers';
import { EEventSummarySections } from '@/types';
import { ECanadaProvinces } from '@libs/shared-lib/types';

import { useMockEventStore } from '@/pinia/event/event.mock';

import { Address } from '@libs/entities-lib/value-objects/address';
import Component from '../components/EventGenericLocationDialog.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();

describe('EventGenericLocationDialog.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          isRegistrationLocation: true,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
          enableAutocomplete() {
            return true;
          },
        },
        stubs: {
          RcGoogleAutocomplete: true,
        },
      });
    });

    describe('province', () => {
      it('renders when country is Canada', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return true;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        const element = wrapper.findDataTest('location-province');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render when country is not Canada', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return false;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        const element = wrapper.findDataTest('location-province');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('specifyOtherProvince', () => {
      it('renders when country is not Canada', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return false;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        const element = wrapper.findDataTest('location-specifiedOtherProvince');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render when country is  Canada', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return true;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        const element = wrapper.findDataTest('location-specifiedOtherProvince');
        expect(element.exists()).toBeFalsy();
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
          isRegistrationLocation: true,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
        },
      });
    });

    describe('canadian provinces', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          isRegistrationLocation: true,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
        },
      });

      it('calls the helper enumToTranslatedCollection and returns the result of the call without the province Other ', async () => {
        jest.spyOn(helpers, 'enumToTranslatedCollection')
          .mockImplementation(() => ([{ value: ECanadaProvinces.QC }, { value: ECanadaProvinces.OT }]));

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        expect(wrapper.vm.canadianProvinces).toEqual([{ value: ECanadaProvinces.QC }]);
        expect(helpers.enumToTranslatedCollection).toHaveBeenCalled();
      });
    });

    describe('isCanada', () => {
      it('returns true is location country is Canada', async () => {
        await wrapper.setData({ location: { address: { country: 'CA' } } });
        expect(wrapper.vm.isCanada).toBeTruthy();
      });

      it('returns true is location country is Canada', async () => {
        await wrapper.setData({ location: { address: { country: 'RO' } } });
        expect(wrapper.vm.isCanada).toBeFalsy();
      });
    });

    describe('statusName', () => {
      it('return the right statusName', () => {
        wrapper.vm.isActive = true;
        expect(wrapper.vm.statusName).toEqual('eventSummary.status.Active');

        wrapper.vm.isActive = false;
        expect(wrapper.vm.statusName).toEqual('eventSummary.status.Inactive');
      });
    });

    describe('title', () => {
      it('return the right title', async () => {
        await wrapper.setProps({
          isRegistrationLocation: true,
          isEditMode: false,
        });
        expect(wrapper.vm.title).toEqual('eventSummary.addRegistrationLocation');

        await wrapper.setProps({
          isRegistrationLocation: true,
          isEditMode: true,
        });
        expect(wrapper.vm.title).toEqual('eventSummary.editRegistrationLocation');

        await wrapper.setProps({
          isRegistrationLocation: false,
          isEditMode: false,
        });
        expect(wrapper.vm.title).toEqual('eventSummary.addShelterLocation');

        await wrapper.setProps({
          isRegistrationLocation: false,
          isEditMode: true,
        });
        expect(wrapper.vm.title).toEqual('eventSummary.editShelterLocation');
      });
    });

    describe('locationNameLabel', () => {
      it('return the right label', async () => {
        await wrapper.setProps({
          isRegistrationLocation: true,
        });
        expect(wrapper.vm.locationNameLabel).toEqual('eventSummary.registrationLocation.name *');

        await wrapper.setProps({
          isRegistrationLocation: false,
        });
        expect(wrapper.vm.locationNameLabel).toEqual('eventSummary.shelterLocation.name *');
      });
    });

    describe('allLocations', () => {
      it('return the right location list', async () => {
        await wrapper.setProps({
          isRegistrationLocation: true,
        });
        expect(wrapper.vm.allLocations).toEqual(mockEvent.registrationLocations);

        await wrapper.setProps({
          isRegistrationLocation: false,
        });
        expect(wrapper.vm.allLocations).toEqual(mockEvent.shelterLocations);
      });
    });

    describe('rules', () => {
      test('name', async () => {
        wrapper.vm.isNameUnique = false;

        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: false, messageKey: 'validations.alreadyExists' },
        });
      });

      test('country', async () => {
        expect(wrapper.vm.rules.country).toEqual({
          required: true,
        });
      });

      test('streetAddress', async () => {
        expect(wrapper.vm.rules.streetAddress).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      test('city', async () => {
        expect(wrapper.vm.rules.city).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('province when country is Canada', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return true;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        expect(wrapper.vm.rules.province).toEqual({
          required: true,
        });
      });

      test('province when country is not Canada', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return false;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        expect(wrapper.vm.rules.province).toEqual({
          required: false,
        });
      });

      test('specifiedOtherProvince when country is Canada', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return true;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        expect(wrapper.vm.rules.specifiedOtherProvince).toEqual({
          required: false,
          max: MAX_LENGTH_SM,
        });
      });

      test('specifiedOtherProvince when country is not Canada', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return false;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        expect(wrapper.vm.rules.specifiedOtherProvince).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('postalCode', async () => {
        wrapper.vm.location.address.country = 'CA';

        expect(wrapper.vm.rules.postalCode).toEqual({
          max: MAX_LENGTH_MD,
          canadianPostalCode: true,
        });
      });
    });

    describe('enableAutocomplete', () => {
      it('returns true if storage returns true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [wrapper.vm.$featureKeys.AddressAutoFill],
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        expect(wrapper.vm.enableAutocomplete).toBe(true);
      });

      it('returns false if storage returns false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          isRegistrationLocation: true,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
        },
      });
    });

    describe('name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-name');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.name);
      });
    });

    describe('country', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-country-validator');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.country);
      });
    });

    describe('streetAddress', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-streetAddress-validator');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.streetAddress);
      });
    });

    describe('city', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-city');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.city);
      });
    });

    describe('province', () => {
      it('is linked to proper rules', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return true;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        const element = wrapper.findDataTest('location-province');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.province);
      });
    });

    describe('specifiedOtherProvince', () => {
      it('is linked to proper rules', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            isRegistrationLocation: true,
          },
          computed: {
            isCanada() {
              return false;
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        const element = wrapper.findDataTest('location-specifiedOtherProvince');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.specifiedOtherProvince);
      });
    });

    describe('postalCode', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-postalCode');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.postalCode);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call initEditMode when edit mode is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        wrapper.vm.initEditMode = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initEditMode).toHaveBeenCalledTimes(1);
      });

      it('should call initCreateMode when edit mode is false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });
        wrapper.vm.initCreateMode = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initCreateMode).toHaveBeenCalledTimes(1);
      });
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
          id: mockEvent.registrationLocations[0].name.translation.en,
          isRegistrationLocation: true,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
        },
      });

      jest.clearAllMocks();
    });

    describe('initCreateMode', () => {
      it('sets location to an empty location', async () => {
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.location).toEqual({
          name: { translation: { en: '', fr: '' } },
          status: EEventLocationStatus.Active,
          address: new Address(),
        });
      });

      it('sets isActive to true', async () => {
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.isActive).toBeTruthy();
      });
    });

    describe('initEditMode', () => {
      it('sets the location to the right values', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: true,
            id: 'shelter-id-1',
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [{
                id: 'shelter-id-1',
                name: {
                  translation: {
                    en: 'shelter en',
                    fr: 'shelter fr rt',
                  },
                },
                status: 2,
                address: {
                  country: 'CA',
                  streetAddress: '2295 Rue Bercy',
                  unitSuite: null,
                  province: 11,
                  city: 'Montréal',
                  postalCode: 'H2K 2V6',
                },
              }];
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        await wrapper.vm.initEditMode();

        expect(wrapper.vm.location).toEqual({
          id: 'shelter-id-1',
          name: {
            translation: {
              en: 'shelter en',
              fr: 'shelter fr rt',
            },
          },
          status: 2,
          address: {
            country: 'CA',
            streetAddress: '2295 Rue Bercy',
            unitSuite: null,
            province: 11,
            city: 'Montréal',
            postalCode: 'H2K 2V6',
          },
        });
      });

      it('sets isActive to true if location status is active', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].id,
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [{
                id: mockEvent.registrationLocations[0].id,
                name: { translation: { en: mockEvent.registrationLocations[0].name.translation.en, fr: 'mock fr' } },
                status: EEventLocationStatus.Active,
                address: {
                  country: null,
                  streetAddress: null,
                  province: null,
                  city: null,
                  postalCode: null,
                },
              }];
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        await wrapper.setProps({ isRegistrationLocation: false });

        await wrapper.vm.initEditMode();

        expect(wrapper.vm.isActive).toBeTruthy();
      });

      it('sets isActive to false if location status is inactive', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].id,
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [{
                id: mockEvent.registrationLocations[0].id,
                name: { translation: { en: mockEvent.registrationLocations[0].name.translation.en, fr: 'mock fr' } },
                status: EEventLocationStatus.Inactive,
                address: {
                  country: null,
                  streetAddress: null,
                  province: null,
                  city: null,
                  postalCode: null,
                },
              }];
            },
            apiKey() {
              return 'mock-apiKey';
            },
          },
        });

        await wrapper.setProps({ isRegistrationLocation: false });

        await wrapper.vm.initEditMode();

        expect(wrapper.vm.isActive).toBeFalsy();
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to registration location name', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.location.name).toEqual({ translation: { en: 'mock-name-en' } });
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

      it('does not call submitLocation if validate is false', async () => {
        jest.spyOn(wrapper.vm, 'submitLocation').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitLocation).toHaveBeenCalledTimes(0);
      });

      it('calls fixNonCanadianProvince if validate is true', async () => {
        jest.spyOn(wrapper.vm, 'fixNonCanadianProvince').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.fixNonCanadianProvince).toHaveBeenCalledTimes(1);
      });

      it('calls submitLocation if validate is true', async () => {
        jest.spyOn(wrapper.vm, 'submitLocation').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitLocation).toHaveBeenCalledTimes(1);
      });

      it('calls handleSubmitError if there is an error', async () => {
        jest.spyOn(wrapper.vm, 'submitLocation').mockImplementation(() => {
          throw new Error();
        });
        jest.spyOn(wrapper.vm, 'handleSubmitError').mockImplementation(() => { });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.onSubmit();
        expect(wrapper.vm.handleSubmitError).toHaveBeenCalledTimes(1);
      });

      it('onSubmit triggers event to close dialog', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')[0]).toBeTruthy();
      });
    });

    describe('submitLocation', () => {
      it('calls updateEventSection with the right payload', async () => {
        await wrapper.vm.submitLocation();

        expect(eventStore.updateEventSection).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: wrapper.vm.location,
          section: EEventSummarySections.RegistrationLocation,
          action: 'add',
        });
      });

      it('calls updateEventSection with the right payload if location is a shelter location', async () => {
        await wrapper.setProps({ isRegistrationLocation: false });
        await wrapper.vm.submitLocation();

        expect(eventStore.updateEventSection).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: wrapper.vm.location,
          section: EEventSummarySections.ShelterLocation,
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
        wrapper.vm.location.status = EEventLocationStatus.Inactive;
        await wrapper.vm.updateStatus(true);
        expect(wrapper.vm.location.status).toEqual(EEventLocationStatus.Active);
      });

      it('sets the status of the call centre to inactive if the argument passed is false', async () => {
        wrapper.vm.location.status = EEventLocationStatus.Active;
        await wrapper.vm.updateStatus(false);
        expect(wrapper.vm.location.status).toEqual(EEventLocationStatus.Inactive);
      });
    });

    describe('fixNonCanadianProvince', () => {
      it('should set province to other if null', () => {
        wrapper.vm.location.address.province = null;
        wrapper.vm.fixNonCanadianProvince();
        expect(wrapper.vm.location.address.province).toEqual(ECanadaProvinces.OT);
      });
      it('should do nothing if not null', () => {
        wrapper.vm.location.address.province = ECanadaProvinces.AB;
        wrapper.vm.fixNonCanadianProvince();
        expect(wrapper.vm.location.address.province).toEqual(ECanadaProvinces.AB);
      });
    });
  });
});
