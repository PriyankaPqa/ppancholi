import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockHouseholdMember } from '@/entities/beneficiary';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';
import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import Component from './HouseholdMemberForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdMemberForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        householdMember: mockHouseholdMember(),
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
  });
});
