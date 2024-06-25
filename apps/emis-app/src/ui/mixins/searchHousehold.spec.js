import searchHousehold from '@/ui/mixins/searchHousehold';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';

const Component = {
  render() {},
  mixins: [searchHousehold],
};

const localVue = createLocalVue();
const { pinia, householdStore } = useMockHouseholdStore();

let wrapper;

describe('searchHousehold', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Methods', () => {
    describe('search', () => {
      it('should set criteria', () => {
        expect(wrapper.vm.criteria).toEqual({});
        wrapper.vm.search({ test: 'test' });
        expect(wrapper.vm.criteria).toEqual({ test: 'test' });
      });

      it('should call search actions with proper parameters', async () => {
        await wrapper.vm.search({});
        expect(householdStore.search).toHaveBeenCalledWith({ params: {
          filter: wrapper.vm.filters,
          includeMembers: true,
        },
        includeInactiveItems: false });
      });

      it('should set searchResults', async () => {
        householdStore.search = jest.fn(() => ({ ids: ['1'] }));
        householdStore.getByIds = jest.fn(() => [mockHouseholdEntity()]);
        await wrapper.setData({
          searchResults: [],
        });
        await wrapper.vm.search({});
        expect(wrapper.vm.searchResults).toEqual([mockHouseholdEntity()]);
      });
    });
  });

  describe('Computed', () => {
    describe('memberFilters', () => {
      it('should add email to filter if here', () => {
        wrapper.setData({
          criteria: {
            emailAddress: 'test@test.ca',
          },
        });

        expect(wrapper.vm.memberFilters).toEqual({ and: [{ 'Person/ContactInformation/Email': 'test@test.ca' }] });
      });

      it('should add birthDate to filter if here', () => {
        wrapper.setData({
          criteria: {
            birthDate: '1990-01-01',
          },
        });

        expect(wrapper.vm.memberFilters).toEqual({ and: [{ 'Person/IdentitySet/DateOfBirth': { eq: new Date('1990-01-01') } }] });
      });

      it('should add phone to filter if here', () => {
        wrapper.setData({
          criteria: {
            phone: '438-888-888',
          },
        });
        const expected = {
          or: [
            { 'Person/ContactInformation/HomePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'Person/ContactInformation/MobilePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'Person/ContactInformation/AlternatePhoneNumber/E164Number': wrapper.vm.criteria.phone },
          ],
        };
        expect(wrapper.vm.memberFilters).toEqual({ and: [expected] });
      });

      it('should add firstName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
          },
        });
        expect(wrapper.vm.memberFilters).toEqual({ and: [{ 'Person/IdentitySet/FirstName': { contains: 'Mister' } }] });
      });

      it('should add lastName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            lastName: 'Test',
          },
        });
        // eslint-disable-next-line max-len
        expect(wrapper.vm.memberFilters).toEqual({ and: [{ 'Person/IdentitySet/LastName': { contains: 'Test' } }] });
      });

      it('should add both to filter if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
            lastName: 'Test',
          },
        });
        expect(wrapper.vm.memberFilters).toEqual({ and: [{ 'Person/IdentitySet/FirstName': { contains: 'Mister' } },
          { 'Person/IdentitySet/LastName': { contains: 'Test' } }] });
      });
    });

    describe('filters', () => {
      it('should return the correct filters', async () => {
        await wrapper.setData({
          criteria: {
            registrationNumber: 'number',
            firstName: 'Mister',
          },
        });
        expect(wrapper.vm.filters).toEqual({
          'Entity/RegistrationNumber': 'number',
          Entity: {
            HouseholdMembers: {
              any: { and: [{ 'Person/IdentitySet/FirstName': { contains: 'Mister' } }] },
            },
          },
        });
      });
    });
  });
});
