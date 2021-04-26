import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import {
  mockGenders,
  mockHouseholdMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockPerson,
} from '@crctech/registration-lib/src/entities/beneficiary';

import {
  mockShelterLocations,
} from '@crctech/registration-lib/src/entities/event';

import { IdentityForm, IndigenousIdentityForm, TempAddressForm } from '@crctech/registration-lib';
import { enumToTranslatedCollection } from '@/ui/utils';
import { ECanadaProvinces } from '@/types';
import { ETemporaryAddressTypes } from '@crctech/registration-lib/src/entities/value-objects/temporary-address/index';
import Component from './HouseholdMemberForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdMemberForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        person: mockHouseholdMember(),
        sameAddress: true,
        genderItems: mockGenders(),
        canadianProvincesItems: enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'),
        indigenousTypesItems: mockIndigenousTypesItems(),
        indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
        temporaryAddressTypeItems: enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes'),
        loading: false,
        apiKey: '1345',
        shelterLocations: mockShelterLocations(),
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Indigenous identity form', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(IndigenousIdentityForm).exists()).toBeTruthy();
      });

      it('should relay province-change event', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('province-change', ECanadaProvinces.ON);
        expect(wrapper.emitted('province-change')[0]).toEqual([ECanadaProvinces.ON]);
      });

      it('should relay change event', () => {
        const component = wrapper.findComponent(IndigenousIdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.emitted('indigenous-identity-change')[0]).toEqual([mockPerson()]);
      });
    });

    describe('Identity form', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(IdentityForm).exists()).toBeTruthy();
      });

      it('should relay change event', () => {
        const component = wrapper.findComponent(IdentityForm);
        component.vm.$emit('change', mockPerson());
        expect(wrapper.emitted('identity-change')[0]).toEqual([mockPerson()]);
      });
    });

    describe('Temporary Address', () => {
      it('should be displayed only is different address', async () => {
        expect(wrapper.findComponent(TempAddressForm).exists()).toBeFalsy();

        await wrapper.setProps({
          sameAddress: false,
        });

        expect(wrapper.findComponent(TempAddressForm).exists()).toBeTruthy();
      });
    });
  });
});
