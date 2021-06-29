import Vuetify from 'vuetify';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';

import Component from '@/ui/views/pages/registration/is-registered/HouseholdResults.vue';
import { mockCombinedHouseholds } from '@crctech/registration-lib/src/entities/household';

const localVue = createLocalVue();

const storage = mockStorage();

const vuetify = new Vuetify();

describe('HouseholdResults.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        items: mockCombinedHouseholds(),
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    describe('hasAdditionalMember', () => {
      it('should return true if additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [{}, {}],
          eventIds: ['1'],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(true);
      });
      it('should return false if no additional member', () => {
        const household = {
          primaryBeneficiary: {},
          additionalMembers: [],
          eventIds: ['1'],
        };
        expect(wrapper.vm.hasAdditionalMember(household)).toBe(false);
      });
    });

    describe('getPhone', () => {
      it('should return mobile phone number if there', () => {
        const household = {
          primaryBeneficiary: {
            mobilePhoneNumber: {
              number: '123',
            },
            homePhoneNumber: {
              number: '456',
            },
            alternatePhoneNumber: {
              number: '789',
            },
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.mobilePhoneNumber.number);
      });
      it('should return home phone number if no mobile', () => {
        const household = {
          primaryBeneficiary: {
            mobilePhoneNumber: null,
            homePhoneNumber: {
              number: '456',
            },
            alternatePhoneNumber: {
              number: '789',
            },
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.homePhoneNumber.number);
      });
      it('should return alternate phone number if no mobile and no home', () => {
        const household = {
          primaryBeneficiary: {
            mobilePhoneNumber: null,
            homePhoneNumber: null,
            alternatePhoneNumber: {
              number: '789',
            },
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.alternatePhoneNumber.number);
      });
    });

    describe('isRegisteredInCurrentEvent', () => {
      it('should return true if household is registered for current event', () => {
        const currentEvent = wrapper.vm.$storage.registration.getters.event();
        const household = {
          primaryBeneficiary: {},
          eventIds: [currentEvent.id],
        };

        const res = wrapper.vm.isRegisteredInCurrentEvent(household);
        expect(res).toBe(true);
      });
      it('should return false if not', () => {
        const household = {
          primaryBeneficiary: {},
          eventIds: ['1'],
        };

        const res = wrapper.vm.isRegisteredInCurrentEvent(household);
        expect(res).toBe(false);
      });
    });
  });

  describe('Computed', () => {
    describe('currentEventId', () => {
      it('should return id of the current event', () => {
        const currentEvent = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.currentEventId)
          .toEqual(currentEvent.id);
      });
    });

    describe('formattedItems', () => {
      it('builds proper object to be displayed in table', () => {
        const res = wrapper.vm.items.map((household) => {
          const final = {
            primaryBeneficiary: {},
            additionalMembers: [],
          };
          household.metadata.memberMetadata.forEach((member) => {
            if (household.entity.primaryBeneficiary === member.id) {
              final.primaryBeneficiary = {
                ...member,
                isPrimary: true,
                registrationNumber: household.entity.registrationNumber,
              };
            } else {
              final.additionalMembers.push({
                ...member,
                isPrimary: false,
                registrationNumber: household.entity.registrationNumber,
              });
            }
            final.eventIds = household.metadata.eventIds;
          });
          return final;
        });
        expect(wrapper.vm.formattedItems).toEqual(res);
      });
    });
  });
});
