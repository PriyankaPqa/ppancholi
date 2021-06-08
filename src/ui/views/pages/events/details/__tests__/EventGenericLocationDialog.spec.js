import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData, EEventLocationStatus } from '@/entities/event';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import entityUtils from '@/entities/utils';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';

import Component from '../components/EventGenericLocationDialog.vue';

const localVue = createLocalVue();
const mockEvent = new Event(mockEventsSearchData()[0]);
const storage = mockStorage();

describe('EventGenericLocationDialog.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
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
          max: MAX_LENGTH_MD,
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
        });
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
        const element = wrapper.findDataTest('location-country');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.country);
      });
    });

    describe('streetAddress', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('location-streetAddress');
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
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event: mockEvent,
          isEditMode: false,
          id: mockEvent.registrationLocations[0].name.translation.en,
          isRegistrationLocation: true,
        },
        mocks: {
          $storage: storage,
        },
      });

      jest.clearAllMocks();
    });

    describe('checkNameUniqueness', () => {
      it('sets isNameUnique to true if the name is not used in other locations', async () => {
        await wrapper.vm.checkNameUniqueness('foo');
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });

      it('sets isNameUnique to false if the name is used in other locations', async () => {
        await wrapper.vm.checkNameUniqueness(mockEvent.registrationLocations[0].name.translation.fr);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });
    });

    describe('initCreateMode', () => {
      it('sets location to an empty location', async () => {
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.location).toEqual({
          name: { translation: { en: '', fr: '' } },
          status: EEventLocationStatus.Active,
          address: {
            country: null,
            streetAddress: null,
            province: null,
            specifiedOtherProvince: null,
            city: null,
            postalCode: null,
          },
        });
      });

      it('sets isActive to true', async () => {
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.isActive).toBeTruthy();
      });
    });

    describe('initEditMode', () => {
      it('calls initRegistrationLocationEdit if isRegistrationLocation', async () => {
        wrapper.setProps({ isRegistrationLocation: true });
        jest.spyOn(wrapper.vm, 'initRegistrationLocationEdit').mockImplementation(() => {});
        expect(wrapper.vm.initRegistrationLocationEdit).toHaveBeenCalledTimes(0);

        await wrapper.vm.initEditMode();
        expect(wrapper.vm.initRegistrationLocationEdit).toHaveBeenCalledTimes(1);
      });

      it('calls initShelterLocationEdit if isRegistrationLocation is false', async () => {
        jest.spyOn(wrapper.vm, 'initShelterLocationEdit').mockImplementation(() => {});
        await wrapper.setProps({ isRegistrationLocation: false });
        expect(wrapper.vm.initShelterLocationEdit).toHaveBeenCalledTimes(0);

        await wrapper.vm.initEditMode();
        expect(wrapper.vm.initShelterLocationEdit).toHaveBeenCalledTimes(1);
      });

      it('sets isActive to true if location status is active', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [{
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
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [{
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
          },
        });

        await wrapper.setProps({ isRegistrationLocation: false });

        await wrapper.vm.initEditMode();

        expect(wrapper.vm.isActive).toBeFalsy();
      });
    });

    describe('initRegistrationLocationEdit', () => {
      it('sets the original location and location to the right values', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: mockEvent.registrationLocations[0].name.translation.en,
            isRegistrationLocation: true,
          },
          computed: {
            allLocations() {
              return [mockEvent.registrationLocations[0]];
            },
          },
        });

        await wrapper.vm.initRegistrationLocationEdit();
        expect(wrapper.vm.originalLocation).toEqual(mockEvent.registrationLocations[0]);
        expect(wrapper.vm.location).toEqual(mockEvent.registrationLocations[0]);
      });
    });

    describe('initShelterLocationEdit', () => {
      it('sets the original location, shelterLocationId and location to the right values', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            event: mockEvent,
            isEditMode: false,
            id: 'shelter en',
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
          },
        });

        await wrapper.vm.initShelterLocationEdit();
        expect(wrapper.vm.originalLocation).toEqual({
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
        expect(wrapper.vm.location).toEqual({
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

        expect(wrapper.vm.shelterLocationId).toEqual('shelter-id-1');
      });
    });

    describe('fillEmptyMultilingualFields', () => {
      it('calls entityUtils.getFilledMultilingualField and assigns the result to registration location name', async () => {
        jest.spyOn(entityUtils, 'getFilledMultilingualField').mockImplementation(() => ({ translation: { en: 'mock-name-en' } }));
        await wrapper.vm.fillEmptyMultilingualFields();
        expect(wrapper.vm.location.name).toEqual({ translation: { en: 'mock-name-en' } });
      });
    });

    describe('onChangeCountry', () => {
      it('resets location address fields', async () => {
        await wrapper.vm.onChangeCountry('CA');
        expect(wrapper.vm.location.address.country).toEqual('CA');
        expect(wrapper.vm.location.address.streetAddress).toBeNull();
        expect(wrapper.vm.location.address.province).toBeNull();
        expect(wrapper.vm.location.address.specifiedOtherProvince).toBeNull();
        expect(wrapper.vm.location.address.city).toBeNull();
        expect(wrapper.vm.location.address.postalCode).toBeNull();
      });
    });

    describe('onSubmit', () => {
      beforeEach(() => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        wrapper.vm.addRegistrationLocation = jest.fn();
        wrapper.vm.editRegistrationLocation = jest.fn();
        wrapper.vm.addShelterLocation = jest.fn();
        wrapper.vm.editShelterLocation = jest.fn();
      });

      it('onSubmit triggers event to close dialog', async () => {
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')[0]).toBeTruthy();
      });

      it('triggers addRegistrationLocation properly', async () => {
        await wrapper.setProps({
          isRegistrationLocation: true,
          isEditMode: false,
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.addRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.editRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.addShelterLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editShelterLocation).toHaveBeenCalledTimes(0);
      });

      it('triggers editRegistrationLocation properly', async () => {
        await wrapper.setProps({
          isRegistrationLocation: true,
          isEditMode: true,
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.addRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.addShelterLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editShelterLocation).toHaveBeenCalledTimes(0);
      });

      it('triggers addShelterLocation properly', async () => {
        await wrapper.setProps({
          isRegistrationLocation: false,
          isEditMode: false,
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.addRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.addShelterLocation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.editShelterLocation).toHaveBeenCalledTimes(0);
      });

      it('triggers editShelterLocation properly', async () => {
        await wrapper.setProps({
          isRegistrationLocation: false,
          isEditMode: true,
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.addRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editRegistrationLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.addShelterLocation).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editShelterLocation).toHaveBeenCalledTimes(1);
      });
    });

    describe('addRegistrationLocation', () => {
      it('calls storage action addRegistrationLocation with the right payload', async () => {
        const [location] = mockEvent.registrationLocations;

        wrapper.vm.location = location;

        await wrapper.vm.addRegistrationLocation();

        expect(storage.event.actions.addRegistrationLocation).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: location,
        });
      });
    });

    describe('editRegistrationLocation', () => {
      it('calls storage action editRegistrationLocation with the right payload', async () => {
        const [originalLocation, location] = mockEvent.registrationLocations;

        wrapper.vm.originalLocation = originalLocation;
        wrapper.vm.location = location;

        await wrapper.vm.editRegistrationLocation();

        expect(storage.event.actions.editRegistrationLocation).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: {
            originalRegistrationLocation: originalLocation,
            updatedRegistrationLocation: location,
          },
        });
      });
    });

    describe('addShelterLocation', () => {
      it('calls storage action addShelterLocation with the right payload', async () => {
        const [location] = mockEvent.shelterLocations;

        wrapper.vm.location = location;

        await wrapper.vm.addShelterLocation();

        expect(storage.event.actions.addShelterLocation).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          payload: location,
        });
      });
    });

    describe('editShelterLocation', () => {
      it('calls storage action editShelterLocation with the right payload', async () => {
        const shelterLocationData = mockEvent.shelterLocations[0];

        const { shelterLocationId, ...location } = shelterLocationData;

        wrapper.vm.location = location;
        wrapper.vm.shelterLocationId = shelterLocationId;

        await wrapper.vm.editShelterLocation();

        expect(storage.event.actions.editShelterLocation).toHaveBeenCalledWith({
          eventId: wrapper.vm.event.id,
          shelterLocationId: wrapper.shelterLocationId,
          payload: location,
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

    describe('streetAddressAutocomplete', () => {
      it('sets into the location object the data it receives as argument correctly when country is Canada', async () => {
        const mockAutocomplete = {
          country: 'CA',
          street: '2295 Rue Bercy',
          unitSuite: null,
          province: 'QC',
          city: 'Montréal',
          postalCode: 'H2K 2V6',
        };
        await wrapper.vm.streetAddressAutocomplete(mockAutocomplete);

        expect(wrapper.vm.location.address.country).toEqual(mockAutocomplete.country);
        expect(wrapper.vm.location.address.streetAddress).toEqual(mockAutocomplete.street);
        expect(wrapper.vm.location.address.province).toEqual(Number(ECanadaProvinces[mockAutocomplete.province]));
        expect(wrapper.vm.location.address.specifiedOtherProvince).toEqual(null);
        expect(wrapper.vm.location.address.city).toEqual(mockAutocomplete.city);
        expect(wrapper.vm.location.address.postalCode).toEqual(mockAutocomplete.postalCode);
      });

      it('sets into the location object the data it receives as argument correctly when country is not Canada', async () => {
        const mockAutocomplete = {
          country: 'US',
          street: '2295 South Str',
          unitSuite: null,
          province: 'NY',
          city: 'New York',
          postalCode: '12345',
        };
        await wrapper.vm.streetAddressAutocomplete(mockAutocomplete);

        expect(wrapper.vm.location.address.country).toEqual(mockAutocomplete.country);
        expect(wrapper.vm.location.address.streetAddress).toEqual(mockAutocomplete.street);
        expect(wrapper.vm.location.address.province).toEqual(ECanadaProvinces.OT);
        expect(wrapper.vm.location.address.specifiedOtherProvince).toEqual(mockAutocomplete.province);
        expect(wrapper.vm.location.address.city).toEqual(mockAutocomplete.city);
        expect(wrapper.vm.location.address.postalCode).toEqual(mockAutocomplete.postalCode);
      });
    });
  });
});
