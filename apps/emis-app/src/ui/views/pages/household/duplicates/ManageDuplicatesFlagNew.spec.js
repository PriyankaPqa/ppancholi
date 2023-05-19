import { createLocalVue, shallowMount } from '@/test/testSetup';
import { HouseholdStatus, mockCombinedHousehold, mockHouseholdMemberMetadata, DuplicateReason } from '@libs/entities-lib/household';
import { Status } from '@libs/entities-lib/base';
import { mockProvider } from '@/services/provider';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import Component from './ManageDuplicatesFlagNew.vue';

const services = mockProvider();
const { pinia, householdStore } = useMockHouseholdStore();
const localVue = createLocalVue();

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
        $hasFeature: () => true,
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
      it('returns the list of members in the metadata of the selected household', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { metadata: { memberMetadata: [mockHouseholdMemberMetadata()] } } });
        expect(wrapper.vm.members).toEqual([mockHouseholdMemberMetadata()]);
      });
    });
  });

  describe('Methods', () => {
    describe('getRegistrationNumberText', () => {
      it('returns the registration number in the passed argument ', () => {
        doMount();
        expect(wrapper.vm.getRegistrationNumberText(mockCombinedHousehold())).toEqual(mockCombinedHousehold().entity.registrationNumber);
      });
    });

    describe('clearForm', () => {
      it('resets all fields if no argument is passed', async () => {
        doMount();
        wrapper.setData({
          selectedDuplicateReasons: [1, 2],
          member: mockHouseholdMemberMetadata(),
          rationale: 'rationale',
          searchTerm: 'abc',
          selectedHousehold: mockCombinedHousehold(),
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
          member: mockHouseholdMemberMetadata(),
          rationale: 'rationale',
          searchTerm: 'abc',
          selectedHousehold: mockCombinedHousehold(),
        });
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.clearForm(false);
        expect(wrapper.vm.selectedDuplicateReasons).toEqual([]);
        expect(wrapper.vm.member).toEqual(null);
        expect(wrapper.vm.rationale).toEqual('');
        expect(wrapper.vm.searchTerm).toEqual('abc');
        expect(wrapper.vm.selectedHousehold).toEqual(mockCombinedHousehold());
      });
    });

    describe('fetchHouseholds', () => {
      it('calls the search with the right params and saves the result in households', async () => {
        doMount();
        wrapper.vm.$services.households.search = jest.fn(() => ({ value: [mockCombinedHousehold({ id: '1', registrationNumber: '111' })] }));
        await wrapper.vm.fetchHouseholds('abc');
        expect(wrapper.vm.$services.households.search).toHaveBeenCalledWith({
          search: 'Entity/RegistrationNumber: ((/.*abc.*/ OR "\\"abc\\""))',
          filter: {
            and: [
              {
                Entity: {
                  Status: Status.Active,
                },
              },
              {
                not: {
                  Entity: {
                    HouseholdStatus: HouseholdStatus.Archived,
                  },
                },
              },
            ],
          },
          queryType: 'full',
          searchMode: 'all',
          orderBy: 'Entity/RegistrationNumber',
        });

        expect(wrapper.vm.households).toEqual([mockCombinedHousehold({ id: '1', registrationNumber: '111' })]);
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
        expect(wrapper.vm.households).toEqual([mockCombinedHousehold({ id: '11', registrationNumber: 'different' })]);
      });
    });

    describe('inputRegistrationNumber', () => {
      it('calls clearForm and debounceSearch when the passed argument is different than the existing registration number', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { entity: { registrationNumber: '12345' } } });
        wrapper.vm.clearForm = jest.fn();
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.vm.inputRegistrationNumber('0000');
        expect(wrapper.vm.clearForm).toHaveBeenCalledWith();
        expect(wrapper.vm.debounceSearch).toHaveBeenCalledWith('0000');
      });
      it('calls only clearForm with false  when the passed argument is same as the existing registration number', async () => {
        doMount();
        await wrapper.setData({ selectedHousehold: { entity: { registrationNumber: '12345' } } });
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
        wrapper.setData({ selectedHousehold: { entity: { id: 'hh-id' } },
          selectedDuplicateReasons: [3],
          member: { firstName: 'Joe', lastName: 'Black' },
          rationale: 'rationale' });
        await wrapper.vm.submit();
        expect(householdStore.flagNewDuplicate).toHaveBeenCalledWith('household-id', {
          duplicateHouseholdId: 'hh-id',
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
        expect(householdStore.flagNewDuplicate).not.toHaveBeenCalledWith();
      });

      it('emits 2 events and displays a toast message if the service call is successful', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$emit = jest.fn();
        wrapper.setData({ selectedHousehold: { entity: { id: 'hh-id' } }, selectedDuplicateReasons: [3], member: { id: 'member-id' }, rationale: 'rationale' });
        await wrapper.vm.submit();
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('fetchDuplicates');
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
