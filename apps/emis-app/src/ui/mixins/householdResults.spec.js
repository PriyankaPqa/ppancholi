import { mockHouseholdEntity } from '@libs/entities-lib/household';
import householdResults from '@/ui/mixins/householdResults';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import routes from '@/constants/routes';
import { mockMember } from '@libs/entities-lib/household-create';

const Component = {
  render() {},
  mixins: [householdResults],
};

const localVue = createLocalVue();
const { pinia, personStore } = useMockPersonStore();

personStore.getById = jest.fn((memberId) => mockMember({ id: memberId }));

let wrapper;

describe('householdResults', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        items: [mockHouseholdEntity({ id: '1', members: ['a', 'b'], primaryBeneficiary: 'a' }), mockHouseholdEntity({ id: '2', members: ['c'], primaryBeneficiary: 'c' })],
      },
    });
  });

  describe('Methods', () => {
    describe('getPhone', () => {
      it('should return mobile phone number if there', () => {
        const household = {
          primaryBeneficiary: {
            contactInformation: {
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
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.contactInformation.mobilePhoneNumber.number);
      });
      it('should return home phone number if no mobile', () => {
        const household = {
          primaryBeneficiary: {
            contactInformation: {
              mobilePhoneNumber: null,
              homePhoneNumber: {
                number: '456',
              },
              alternatePhoneNumber: {
                number: '789',
              },
            },
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.contactInformation.homePhoneNumber.number);
      });
      it('should return alternate phone number if no mobile and no home', () => {
        const household = {
          primaryBeneficiary: {
            contactInformation: {
              mobilePhoneNumber: null,
              homePhoneNumber: null,
              alternatePhoneNumber: {
                number: '789',
              },
            },
          },
        };

        const res = wrapper.vm.getPhone(household);
        expect(res).toEqual(household.primaryBeneficiary.contactInformation.alternatePhoneNumber.number);
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
        const res = [
          { additionalMembers: [mockMember({ id: 'b' })], householdStatus: 0, id: '1', primaryBeneficiary: mockMember({ id: 'a' }), registrationNumber: 'string' },
          { additionalMembers: [], householdStatus: 0, id: '2', primaryBeneficiary: mockMember({ id: 'c' }), registrationNumber: 'string' },
        ];
        expect(wrapper.vm.formattedItems).toEqual(res);
      });
    });
  });
});
