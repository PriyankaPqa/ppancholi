import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import {
  mockGenders,
  mockHouseholdMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, mockPerson,
} from '@/entities/beneficiary';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';
import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';
import utils from '@/entities/utils';
import { ECanadaProvinces } from '@/types';
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
        canadianProvincesItems: utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'),
        indigenousTypesItems: mockIndigenousTypesItems(),
        indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
        loading: false,
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

      test('hide remaining home props is linked to noFixedHome', async () => {
        await wrapper.setProps({
          sameAddress: false,
        });

        const props = wrapper.findComponent(TempAddressForm).props('hideRemainingHome');
        expect(props).toEqual(true);
      });
    });
  });
});
