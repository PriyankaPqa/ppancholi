import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdEntity, mockCombinedHousehold } from '@libs/entities-lib/household';
import { DuplicateReason } from '@libs/entities-lib/potential-duplicate';
import { mockProvider } from '@/services/provider';
import { useMockPotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { mockMember } from '@libs/entities-lib/household-create';
import Component from './ManageDuplicatesFlagNew.vue';

const services = mockProvider();
const { pinia, potentialDuplicateStore } = useMockPotentialDuplicateStore();
const { personStore } = useMockPersonStore(pinia);
const localVue = createLocalVue();

personStore.getByIds = jest.fn((ids) => ids.map((x) => mockMember({ id: x })));

describe('ManageDuplicatesFlagNew.vue', () => {
  let wrapper;

  const doMount = async (customOptions = null) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        householdId: 'household-id',
        householdRegistrationNumber: '123456',
      },
      mocks: {
        $services: services,
      },
      ...customOptions,
    };

    wrapper = shallowMount(Component, options);
  };

  describe('Computed', () => {
    describe('duplicateReasons', () => {
      it('returns the list of duplicate reasons', () => {
        doMount();
        expect(wrapper.vm.duplicateReasons).toEqual([
          {
            dataTest: 'FullName',
            text: 'Member full name',
            value: 1,
          },
          {
            dataTest: 'HomeAddress',
            text: 'Home address',
            value: 2,
          },
          {
            dataTest: 'HomePhoneNumber',
            text: 'Home phone number',
            value: 3,
          },
          {
            dataTest: 'MobilePhoneNumber',
            text: 'Mobile phone number',
            value: 4,
          },
          {
            dataTest: 'AlternatePhoneNumber',
            text: 'Alternate phone number',
            value: 5,
          },
        ]);
      });
    });

    describe('members', () => {
      it('returns the list of members', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { members: ['abc'] } });
        expect(wrapper.vm.members).toEqual([mockMember({ id: 'abc' })]);
      });
    });
  });

  describe('Methods', () => {
    describe('getRegistrationNumberText', () => {
      it('returns the registration number in the passed argument ', () => {
        doMount();
        expect(wrapper.vm.getRegistrationNumberText(mockHouseholdEntity())).toEqual(mockHouseholdEntity().registrationNumber);
      });
    });

    describe('clearForm', () => {
      it('resets all fields if no argument is passed', async () => {
        doMount();
        wrapper.setData({
          selectedDuplicateReasons: [1, 2],
          member: mockMember(),
          rationale: 'rationale',
          searchTerm: 'abc',
          selectedHousehold: mockHouseholdEntity(),
        });
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.clearForm();
        expect(wrapper.vm.selectedDuplicateReasons).toEqual([]);
        expect(wrapper.vm.member).toEqual(null);
        expect(wrapper.vm.rationale).toEqual('');
        expect(wrapper.vm.selectedHousehold).toEqual(null);
      });

      it('does not reset selectedHousehold and searchTerm if argument false is passed', async () => {
        doMount();
        wrapper.setData({
          selectedDuplicateReasons: [1, 2],
          member: mockMember(),
          rationale: 'rationale',
          searchTerm: 'abc',
          selectedHousehold: mockHouseholdEntity(),
        });
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.clearForm(false);
        expect(wrapper.vm.selectedDuplicateReasons).toEqual([]);
        expect(wrapper.vm.member).toEqual(null);
        expect(wrapper.vm.rationale).toEqual('');
        expect(wrapper.vm.searchTerm).toEqual('abc');
        expect(wrapper.vm.selectedHousehold).toEqual(mockHouseholdEntity());
      });
    });

    describe('fetchHouseholds', () => {
      it('calls the search with the right params and saves the result in households', async () => {
        doMount();
        wrapper.vm.$services.households.search = jest.fn(() => ({ value: [mockCombinedHousehold({ id: '1', registrationNumber: '111' })] }));
        await wrapper.vm.fetchHouseholds('abc');
        expect(wrapper.vm.$services.households.search).toHaveBeenCalledWith({
          filter: {
            and: [
              {
                Entity: {
                  RegistrationNumber: { contains: 'abc' },
                },
              },
              {
                Entity: {
                  Status: 'Active',
                },
              },
              {
                not: {
                  Entity: {
                    HouseholdStatus: 'Archived',
                  },
                },
              },
            ],
          },
          queryType: 'full',
          searchMode: 'all',
          orderBy: 'Entity/RegistrationNumber',
        });

        expect(wrapper.vm.households).toEqual([mockHouseholdEntity({ id: '1', registrationNumber: '111' })]);
      });

      it('excludes the current household when it saves the result to households', async () => {
        doMount();
        wrapper.setProps({ householdRegistrationNumber: 'same' });
        wrapper.vm.$services.households.search = jest.fn(() => ({ value:
          [
            mockCombinedHousehold({ id: '11', registrationNumber: 'different' }),
            mockCombinedHousehold({ id: '22', registrationNumber: 'same' }),
          ] }));

        await wrapper.vm.fetchHouseholds('abc');
        expect(wrapper.vm.households).toEqual([mockHouseholdEntity({ id: '11', registrationNumber: 'different' })]);
      });
    });

    describe('inputRegistrationNumber', () => {
      it('calls clearForm and debounceSearch when the passed argument is different than the existing registration number', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { registrationNumber: '12345' } });
        wrapper.vm.clearForm = jest.fn();
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.vm.inputRegistrationNumber('0000');
        expect(wrapper.vm.clearForm).toHaveBeenCalledWith();
        expect(wrapper.vm.debounceSearch).toHaveBeenCalledWith('0000');
      });
      it('calls only clearForm with false  when the passed argument is same as the existing registration number', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { registrationNumber: '12345' } });
        wrapper.vm.clearForm = jest.fn();
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.vm.inputRegistrationNumber('12345');
        expect(wrapper.vm.clearForm).toHaveBeenCalledWith(false);
        expect(wrapper.vm.debounceSearch).not.toHaveBeenCalled();
      });
    });

    describe('debounceSearch', () => {
      it('should call fetchHouseholds if parameter is longer than 3 digits', async () => {
        doMount();
        wrapper.vm.fetchHouseholds = jest.fn();
        wrapper.vm.debounceSearch('1234');
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));
        expect(wrapper.vm.fetchHouseholds).toHaveBeenCalledWith('1234');
      });

      it('should not call fetchHouseholds if parameter is 3 digits or shorter', async () => {
        doMount();
        wrapper.vm.fetchHouseholds = jest.fn();
        wrapper.vm.debounceSearch('123');
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));
        expect(wrapper.vm.fetchHouseholds).not.toHaveBeenCalledWith('1234');
      });
    });

    describe('submit', () => {
      it('calls flagNewDuplicate service with the right params if the form is valid', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.setData({ selectedHousehold: { id: 'hh-id' },
          selectedDuplicateReasons: [3],
          member: { identitySet: { firstName: 'Joe', lastName: 'Black' } },
          rationale: 'rationale' });
        await wrapper.vm.submit();
        expect(potentialDuplicateStore.flagNewDuplicate).toHaveBeenCalledWith({
          householdIds: ['hh-id', wrapper.vm.householdId],
          duplicateReasons: [3],
          memberFirstName: 'Joe',
          memberLastName: 'Black',
          rationale: 'rationale',
        });
      });

      it('does not call flagNewDuplicate service if the form is not valid', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.submit();
        expect(potentialDuplicateStore.flagNewDuplicate).not.toHaveBeenCalledWith();
      });

      it('emits 2 events and displays a toast message if the service call is successful', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$emit = jest.fn();
        wrapper.setData({ selectedHousehold: { id: 'hh-id' }, selectedDuplicateReasons: [3], member: { id: 'member-id' }, rationale: 'rationale' });
        await wrapper.vm.submit();
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('fetchDuplicateHouseholds');
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('goToFirstTab');
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('householdDetails.manageDuplicates.message.success');
      });
    });
  });

  describe('watch', () => {
    describe('selectedDuplicateReasons', () => {
      it('resets member after FullName reason is removed from selectedDuplicateReasons', async () => {
        doMount();
        await wrapper.setData({ member: { id: 'member-id' }, selectedDuplicateReasons: [DuplicateReason.FullName, DuplicateReason.HomeAddress] });
        await wrapper.setData({ selectedDuplicateReasons: [DuplicateReason.HomeAddress] });
        expect(wrapper.vm.member).toBeNull();
      });
    });
  });
});
