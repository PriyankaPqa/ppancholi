import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';

import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';

import Component from './SplitHouseholdMembers.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('SplitHouseholdMembers', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: { $storage: storage },
        computed: {
          members() {
            return [mockMember({ id: '1' })];
          },
        },
      });
    });

    describe('additional member section', () => {
      it('renders the component', () => {
        const element = wrapper.findDataTest('additionalMember_0');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('members', () => {
      it('returns the right result of the store getter householdCreate ', () => {
        const household = { additionalMembers: [mockMember({ id: '1' })] };
        storage.registration.getters.householdCreate = jest.fn(() => household);
        wrapper = shallowMount(Component, {
          localVue,
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.members).toEqual(household.additionalMembers);
      });
    });
  });
});
