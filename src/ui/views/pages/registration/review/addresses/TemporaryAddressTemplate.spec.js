import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockRemainingHome, mockCampGround, mockUnknown, mockOther, mockFriendsFamily, mockShelter,
} from '@crctech/registration-lib/src/entities/beneficiary';
import Component from './TemporaryAddressTemplate.vue';

const localVue = createLocalVue();

describe('TemporaryAddressTemplate.vue', () => {
  let wrapper;

  beforeEach(async () => {
    const vuetify = new Vuetify();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        address: mockCampGround(),
      },
    });
  });

  describe('Template', () => {
    it('should display unknown address', async () => {
      await wrapper.setProps({
        address: mockUnknown(),
      });
      const el = wrapper.findDataTest('temporaryAddress__unknown');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.Unknown');
    });

    it('should display remaining home', async () => {
      await wrapper.setProps({
        address: mockRemainingHome(),
      });
      const el = wrapper.findDataTest('temporaryAddress__remainingHome');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.RemainingInHome');
    });

    it('should display placeName if other type is selected', async () => {
      await wrapper.setProps({
        address: mockOther(),
      });
      const el = wrapper.findDataTest('temporaryAddress__other');
      expect(el.text()).toBe(mockOther().placeName);
    });

    it('should display the type correctly', () => {
      const el = wrapper.findDataTest('temporaryAddress__type');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.Campground');
    });

    describe('Place name', () => {
      it('should display the placeName if the type requires it', () => {
        const el = wrapper.findDataTest('temporaryAddress__name');
        expect(el.text()).toBe(wrapper.vm.address.placeName);
      });

      it('should display the placeName and placeNumber if the type requires it', async () => {
        await wrapper.setProps({
          address: mockCampGround({ placeNumber: '123' }),
        });
        const el = wrapper.findDataTest('temporaryAddress__name');
        const expected = `${wrapper.vm.address.placeName} #${wrapper.vm.address.placeNumber}`;
        expect(el.text().replace(/\s+/g, ' ').trim()).toMatch(expected);
      });
    });

    describe('Street', () => {
      it('should display the street', () => {
        const el = wrapper.findDataTest('temporaryAddress__street');
        expect(el.text()).toBe(wrapper.vm.address.street);
      });

      it('should display the street and the unit suite if the type requires it', async () => {
        await wrapper.setProps({
          address: mockFriendsFamily({ unitSuite: '123' }),
        });
        const el = wrapper.findDataTest('temporaryAddress__street');
        const expected = `${wrapper.vm.address.street} #${wrapper.vm.address.unitSuite}`;
        expect(el.text().replace(/\s+/g, ' ').trim()).toMatch(expected);
      });
    });

    it('should display address line correctly', () => {
      const el = wrapper.findDataTest('temporaryAddress__line');
      expect(el.text()).toBe(wrapper.vm.temporaryAddressLine);
    });

    it('should display the country correctly', () => {
      const el = wrapper.findDataTest('temporaryAddress__country');
      expect(el.text()).toBe(wrapper.vm.address.country);
    });

    it('should display shelter name correctly if type is shelter', async () => {
      await wrapper.setProps({
        address: mockShelter(),
      });
      const el = wrapper.findDataTest('temporaryAddress__shelterLocationName');
      expect(el.text()).toBe(wrapper.vm.getShelterLocationName);
    });
  });

  describe('Computed', () => {
    describe('getShelterLocationName', () => {
      it('should return correct shelter', async () => {
        await wrapper.setProps({
          address: mockShelter(),
        });
        expect(wrapper.vm.getShelterLocationName).toBe(mockShelter().shelterId);
      });
    });

    describe('hasRemainingHomeTemporaryAddress', () => {
      it('should return true if remaining home', async () => {
        await wrapper.setProps({
          address: mockRemainingHome(),
        });
        expect(wrapper.vm.hasRemainingHomeTemporaryAddress).toBe(true);
      });

      it('should return false if not remaining home', () => {
        expect(wrapper.vm.hasRemainingHomeTemporaryAddress).toBe(false);
      });
    });

    describe('hasUnknownTemporaryAddress', () => {
      it('should return true if unknown', async () => {
        await wrapper.setProps({
          address: mockUnknown(),
        });
        expect(wrapper.vm.hasUnknownTemporaryAddress).toBe(true);
      });

      it('should return false if not unknown', () => {
        expect(wrapper.vm.hasUnknownTemporaryAddress).toBe(false);
      });
    });

    describe('hasOtherTemporaryAddress', () => {
      it('should return true if other', async () => {
        await wrapper.setProps({
          address: mockOther(),
        });
        expect(wrapper.vm.hasOtherTemporaryAddress).toBe(true);
      });

      it('should return false if not unknown', () => {
        expect(wrapper.vm.hasOtherTemporaryAddress).toBe(false);
      });
    });

    describe('temporaryAddressLine', () => {
      it('should show city, province and postal code', () => {
        expect(wrapper.vm.temporaryAddressLine).toBe('Ottawa, ON, K1W 1G7');
      });
    });
  });
});
