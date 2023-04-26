import { mockCombinedHouseholds } from '@libs/entities-lib/household';
import householdResults from '@/ui/mixins/householdResults';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';

const Component = {
  render() {},
  mixins: [householdResults],
};

const localVue = createLocalVue();

let wrapper;

describe('householdResults', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        items: mockCombinedHouseholds(),
      },
    });
  });

  describe('Methods', () => {
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

    describe('getHouseholdRoute', () => {
      it('should return the right route data', () => {
        const household = { id: '1234' };
        expect(wrapper.vm.getHouseholdRoute(household)).toEqual({
          name: routes.household.householdProfile.name,
          params: { id: household.id },
        });
      });
    });
  });

  describe('Computed', () => {
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
                householdStatus: household.entity.householdStatus,
              };
            } else {
              final.additionalMembers.push({
                ...member,
                isPrimary: false,
                registrationNumber: household.entity.registrationNumber,
              });
            }
            final.id = household.entity.id;
          });
          return final;
        });
        expect(wrapper.vm.formattedItems).toEqual(res);
      });
    });
  });
});
