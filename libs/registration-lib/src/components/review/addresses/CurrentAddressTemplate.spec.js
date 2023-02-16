import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  mockRemainingHome, mockCampGround, mockUnknown, mockOther, mockFriendsFamily, mockShelter,
} from '@libs/entities-lib/household-create';
import Component from './CurrentAddressTemplate.vue';

const localVue = createLocalVue();

describe('CurrentAddressTemplate.vue', () => {
  let wrapper;

  beforeEach(async () => {
    const vuetify = new Vuetify();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        currentAddress: mockCampGround(),
      },
    });
  });

  describe('Template', () => {
    it('should display unknown currentAddress', async () => {
      await wrapper.setProps({
        currentAddress: mockUnknown(),
      });
      const el = wrapper.findDataTest('currentAddress__unknown');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.Unknown');
    });

    it('should display remaining home', async () => {
      await wrapper.setProps({
        currentAddress: mockRemainingHome(),
      });
      const el = wrapper.findDataTest('currentAddress__remainingHome');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.RemainingInHome');
    });

    it('should display placeName if other type is selected', async () => {
      await wrapper.setProps({
        currentAddress: mockOther(),
      });
      const el = wrapper.findDataTest('currentAddress__other');
      expect(el.text()).toBe(mockOther().placeName);
    });

    it('should display the type correctly', () => {
      const el = wrapper.findDataTest('currentAddress__type');
      expect(el.text()).toBe('registration.addresses.temporaryAddressTypes.Campground');
    });

    describe('Place name', () => {
      it('should display the placeName if the type requires it', () => {
        const el = wrapper.findDataTest('currentAddress__name');
        expect(el.text()).toBe(wrapper.vm.currentAddress.placeName);
      });

      it('should display the placeName and placeNumber if the type requires it', async () => {
        await wrapper.setProps({
          currentAddress: mockCampGround({ placeNumber: '123' }),
        });
        const el = wrapper.findDataTest('currentAddress__name');
        const expected = `${wrapper.vm.currentAddress.placeName} #${wrapper.vm.currentAddress.placeNumber}`;
        expect(el.text().replace(/\s+/g, ' ').trim()).toMatch(expected);
      });

      it('should display the placeName and placeNumber if type is shelter location and has a number', async () => {
        const shelter = mockShelter();
        shelter.placeNumber = '123';
        shelter.placeName = 'placeName';
        await wrapper.setProps({
          currentAddress: shelter,
        });
        const el = wrapper.findDataTest('currentAddress__name');
        const expected = `${wrapper.vm.currentAddress.placeName} #${wrapper.vm.currentAddress.placeNumber}`;
        expect(el.text().replace(/\s+/g, ' ').trim()).toMatch(expected);
      });
    });

    describe('Street', () => {
      it('should display the street', () => {
        const el = wrapper.findDataTest('currentAddress__street');
        expect(el.text()).toBe(wrapper.vm.currentAddress.address.streetAddress);
      });

      it('should display the street and the unit suite if the type requires it', async () => {
        await wrapper.setProps({
          currentAddress: mockFriendsFamily({ address: { unitSuite: '555' } }),
        });
        const el = wrapper.findDataTest('currentAddress__street');
        const expected = `${wrapper.vm.currentAddress.address.streetAddress} #${wrapper.vm.currentAddress.address.unitSuite}`;
        expect(el.text().replace(/\s+/g, ' ').trim()).toMatch(expected);
      });
    });

    it('should display currentAddress line correctly', () => {
      const el = wrapper.findDataTest('currentAddress__line');
      expect(el.text()).toBe(wrapper.vm.currentAddressLine);
    });

    it('should display the country correctly', () => {
      const el = wrapper.findDataTest('currentAddress__country');
      expect(el.text()).toBe(wrapper.vm.currentAddress.address.country);
    });

    it('should display shelter name correctly if type is shelter', async () => {
      await wrapper.setProps({
        currentAddress: mockShelter(),
      });
      const el = wrapper.findDataTest('currentAddress__shelterLocationName');
      expect(el.text()).toBe(wrapper.vm.shelterLocationName);
    });
  });

  describe('Computed', () => {
    describe('shelterLocationName', () => {
      it('should return correct shelter', async () => {
        await wrapper.setProps({
          currentAddress: mockShelter(),
        });
        expect(wrapper.vm.shelterLocationName).toBe(mockShelter().shelterLocation.name.translation.en);
      });
    });

    describe('hasRemainingHomeCurrentAddress', () => {
      it('should return true if remaining home', async () => {
        await wrapper.setProps({
          currentAddress: mockRemainingHome(),
        });
        expect(wrapper.vm.hasRemainingHomeCurrentAddress).toBe(true);
      });

      it('should return false if not remaining home', () => {
        expect(wrapper.vm.hasRemainingHomeCurrentAddress).toBe(false);
      });
    });

    describe('hasUnknownCurrentAddress', () => {
      it('should return true if unknown', async () => {
        await wrapper.setProps({
          currentAddress: mockUnknown(),
        });
        expect(wrapper.vm.hasUnknownCurrentAddress).toBe(true);
      });

      it('should return false if not unknown', () => {
        expect(wrapper.vm.hasUnknownCurrentAddress).toBe(false);
      });
    });

    describe('hasOtherCurrentAddress', () => {
      it('should return true if other', async () => {
        await wrapper.setProps({
          currentAddress: mockOther(),
        });
        expect(wrapper.vm.hasOtherCurrentAddress).toBe(true);
      });

      it('should return false if not unknown', () => {
        expect(wrapper.vm.hasOtherCurrentAddress).toBe(false);
      });
    });

    describe('hasShelterCurrentAddress', () => {
      it('should return true if shelter', async () => {
        await wrapper.setProps({
          currentAddress: mockShelter(),
        });
        expect(wrapper.vm.hasShelterCurrentAddress).toBe(true);
      });

      it('should return false if not shelter', () => {
        expect(wrapper.vm.hasShelterCurrentAddress).toBe(false);
      });
    });

    describe('currentAddressLine', () => {
      it('should show city, province and postal code', () => {
        expect(wrapper.vm.currentAddressLine).toBe('Ottawa, ON, K1W 1G7');
      });
    });
  });
});
