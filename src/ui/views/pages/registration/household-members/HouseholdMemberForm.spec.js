import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockHouseholdMember } from '@/entities/beneficiary';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';
import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import TempAddressForm from '@/ui/views/components/shared/form/TempAddressForm.vue';
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
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    test('Identity form is rendered', () => {
      expect(wrapper.findComponent(IdentityForm).exists()).toBeTruthy();
    });

    test('Indigenous identity form is rendered', () => {
      expect(wrapper.findComponent(IndigenousIdentityForm).exists()).toBeTruthy();
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
