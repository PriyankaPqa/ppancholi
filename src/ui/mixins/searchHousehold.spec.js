/**
 * @group ui/mixins
 */

import { mockStorage } from '@crctech/registration-lib/src/store/storage';
import searchHousehold from '@/ui/mixins/searchHousehold';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import moment from '@/ui/plugins/moment';

const Component = {
  render() {},
  mixins: [searchHousehold],
};

const localVue = createLocalVue();
const storage = mockStorage();

let wrapper;

describe('searchHousehold', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
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
        expect(wrapper.vm.$storage.household.actions.search).toHaveBeenCalledWith({
          search: wrapper.vm.searchCriteria,
          filter: wrapper.vm.filters,
          top: 999,
          queryType: 'full',
        });
      });

      it('should set searchResults', async () => {
        await wrapper.setData({
          searchResults: [],
        });
        await wrapper.vm.search({});
        expect(wrapper.vm.searchResults).toEqual(wrapper.vm.$storage.household.getters.getByIds());
      });
    });
  });

  describe('Computed', () => {
    describe('metadataFilters', () => {
      it('should add email to filter if here', () => {
        wrapper.setData({
          criteria: {
            emailAddress: 'test@test.ca',
          },
        });
        const expected = {
          Email: wrapper.vm.criteria.emailAddress,
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });

      it('should add birthDate to filter if here', () => {
        wrapper.setData({
          criteria: {
            birthDate: '1990-01-01',
          },
        });
        const expected = {
          DateOfBirth: moment.utc(wrapper.vm.criteria.birthDate).format(),
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });

      it('should add phone to filter if here', () => {
        wrapper.setData({
          criteria: {
            phone: '438-888-888',
          },
        });
        const expected = {
          or: [
            { 'HomePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'MobilePhoneNumber/E164Number': wrapper.vm.criteria.phone },
            { 'AlternatePhoneNumber/E164Number': wrapper.vm.criteria.phone },
          ],
        };
        expect(wrapper.vm.metadataFilters).toEqual(expected);
      });
    });

    describe('searchCriteria', () => {
      it('should add firstName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
          },
        });
        const expected = `Metadata/MemberMetadata/FirstName:/.*${wrapper.vm.criteria.firstName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });

      it('should add lastName to search if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            lastName: 'Test',
          },
        });
        const expected = `Metadata/MemberMetadata/LastName:/.*${wrapper.vm.criteria.lastName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });

      it('should add both to filter if here (contains operator)', () => {
        wrapper.setData({
          criteria: {
            firstName: 'Mister',
            lastName: 'Test',
          },
        });
        const expected = `Metadata/MemberMetadata/FirstName:/.*${wrapper.vm.criteria.firstName}.*/
        AND Metadata/MemberMetadata/LastName:/.*${wrapper.vm.criteria.lastName}.*/`;
        expect(wrapper.vm.searchCriteria).toEqual(expected);
      });
    });

    describe('filters', () => {
      it('should return the correct filters', () => {
        expect(wrapper.vm.filters).toEqual({
          and: [
            {
              Metadata: {
                MemberMetadata: {
                  any: {
                    ...wrapper.vm.metadataFilters,
                  },
                },
              },
            },
            {
              Entity: {
                RegistrationNumber: wrapper.vm.criteria.registrationNumber,
              },
            },
          ],
        });
      });
    });
  });
});
