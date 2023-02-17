import { mockMember } from '@libs/entities-lib/value-objects/member';

import { createLocalVue, shallowMount } from '@/test/testSetup';

import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';

import Component from './SplitHouseholdMembers.vue';

const localVue = createLocalVue();

const { pinia, registrationStore } = useMockRegistrationStore();
describe('SplitHouseholdMembers', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,

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
        registrationStore.getHouseholdCreate = jest.fn(() => household);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,

        });

        expect(wrapper.vm.members).toEqual(household.additionalMembers);
      });
    });
  });
});
