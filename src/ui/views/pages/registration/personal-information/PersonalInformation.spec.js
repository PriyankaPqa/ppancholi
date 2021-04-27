import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  IdentityForm, ContactInformationForm, IndigenousIdentityForm,
  mockContactInformation,
  mockPerson,
} from '@crctech/registration-lib';

import { mockStorage } from '@/store/storage';

import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';
import Component from './PersonalInformation.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('PersonalInformation.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      data() {
        return {
          form: storage.beneficiary.getters.personalInformation(),
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });
  });

  describe('Template', () => {
    it('should render identity form', () => {
      const component = wrapper.findComponent(IdentityForm);
      expect(component.exists()).toBeTruthy();
    });

    it('should render contact information form', () => {
      const component = wrapper.findComponent(ContactInformationForm);
      expect(component.exists()).toBeTruthy();
    });

    it('should render indigenous identity form', () => {
      const component = wrapper.findComponent(IndigenousIdentityForm);
      expect(component.exists()).toBeTruthy();
    });

    describe('Methods', () => {
      describe('onIndigenousProvinceChange', () => {
        it('should be called when province is changing', () => {
          jest.spyOn(wrapper.vm, 'onIndigenousProvinceChange');
          const component = wrapper.findComponent(IndigenousIdentityForm);
          component.vm.$emit('province-change', ECanadaProvinces.ON);
          expect(wrapper.vm.onIndigenousProvinceChange).toHaveBeenCalledWith(ECanadaProvinces.ON);
        });
      });

      describe('setIndigenousIdentity', () => {
        it('should be called when indigenous identity is changed', () => {
          jest.spyOn(wrapper.vm, 'setIndigenousIdentity');
          const component = wrapper.findComponent(IndigenousIdentityForm);
          component.vm.$emit('change', mockPerson());
          expect(wrapper.vm.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
        });
      });

      describe('setIdentity', () => {
        it('should be called when identity is changed', () => {
          jest.spyOn(wrapper.vm, 'setIdentity');
          const component = wrapper.findComponent(IdentityForm);
          component.vm.$emit('change', mockPerson());
          expect(wrapper.vm.setIdentity).toHaveBeenCalledWith(mockPerson());
        });
      });

      describe('setContactInformation', () => {
        it('should be called when contact information is changed', () => {
          jest.spyOn(wrapper.vm, 'setContactInformation');
          const component = wrapper.findComponent(ContactInformationForm);
          component.vm.$emit('change', mockContactInformation());
          expect(wrapper.vm.setContactInformation).toHaveBeenCalledWith(mockContactInformation());
        });
      });
    });
  });
});
