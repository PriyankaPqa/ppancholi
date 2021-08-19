import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockHouseholdCreate, mockIdentitySetData } from '@crctech/registration-lib/src/entities/household-create';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers';

import { mockStorage } from '@/store/storage';

import Component from '../PrimaryMemberDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };

describe('PrimaryMemberDialog', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);
  storage.registration.getters.personalInformation = jest.fn(() => mockIdentitySetData());

  libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);
  helpers.enumToTranslatedCollection = jest.fn(() => [{ id: 'foo' }]);

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call personalInformation getter and save the result into backupPersonalInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.$storage.registration.getters.personalInformation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.backupPersonalInfo).toEqual(mockIdentitySetData());
      });
      it('should save the currentAddress into backupAddress', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },
          computed: {
            member() { return householdCreate.primaryBeneficiary; },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.backupAddress).toEqual(householdCreate.primaryBeneficiary.currentAddress);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
          shelterLocations: [],
        },
        data() {
          return { apiKey: '123' };
        },
        mocks: { $storage: storage },
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual([{ id: '1' }]);
      });
    });

    describe('changedAddress', () => {
      it('returns false if the address and the backup address are the same', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return {
              apiKey: '123',
              backupAddress: householdCreate.primaryBeneficiary.currentAddress,
            };
          },
          computed: {
            member() { return householdCreate.primaryBeneficiary; },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.changedAddress).toBeFalsy();
      });

      it('returns true if the address and the backup address are not the same', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return {
              apiKey: '123',
            };
          },
          computed: {
            member() { return householdCreate.primaryBeneficiary; },
          },
        });

        await wrapper.setData({
          backupAddress: {
            ...householdCreate.primaryBeneficiary.currentAddress,
            address: { ...householdCreate.primaryBeneficiary.currentAddress.address, unitSuite: '999' },
          },
        });

        expect(wrapper.vm.changedAddress).toBeTruthy();
      });
    });

    describe('changedPersonalInfo', () => {
      it('returns false if the personal info and the backup info are the same', async () => {
        await wrapper.setData({ backupPersonalInfo: householdCreate.primaryBeneficiary.identitySet });
        expect(wrapper.vm.changedPersonalInfo).toBeFalsy();
      });

      it('returns true if the personal info and the backup info are not the same', async () => {
        await wrapper.setData({
          backupPersonalInfo: {
            ...mockIdentitySetData(),
            firstName: 'Foo',
          },
        });
        expect(wrapper.vm.changedPersonalInfo).toBeTruthy();
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the full list of temporary addresses types', async () => {
        expect(wrapper.vm.currentAddressTypeItems).toEqual([{ id: 'foo' }]);
      });
    });

    describe('title', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.title).toEqual('household.details.edit.title');
      });
    });

    describe('member', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.member).toEqual(householdCreate.primaryBeneficiary);
      });
    });

    describe('additionalMembers', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.additionalMembers).toEqual(householdCreate.additionalMembers);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
          shelterLocations: [],
        },
        data() {
          return { apiKey: '123' };
        },
        computed: {
          member() { return householdCreate.primaryBeneficiary; },
        },
        mocks: { $storage: storage },
      });
    });

    describe('onCancel', () => {
      it('calls the setPersonalInformation mutations', async () => {
        await wrapper.setData({ backupPersonalInfo: mockIdentitySetData() });
        await wrapper.vm.onCancel();
        expect(storage.registration.mutations.setPersonalInformation).toHaveBeenCalledWith(mockIdentitySetData());
      });

      it('calls the setCurrentAddress mutation', async () => {
        await wrapper.setData({ backupAddress: householdCreate.primaryBeneficiary.currentAddress });
        await wrapper.vm.onCancel();
        expect(storage.registration.mutations.setCurrentAddress).toHaveBeenCalledWith(householdCreate.primaryBeneficiary.currentAddress);
      });

      it('emits close', async () => {
        await wrapper.vm.onCancel();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });

    describe('onSubmit', () => {
      it('Submit calls validate method', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls submitPersonalInfoUpdate if changedPersonalInfo is true', async () => {
        jest.spyOn(wrapper.vm, 'submitPersonalInfoUpdate').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({
          backupPersonalInfo: {
            ...mockIdentitySetData(),
            firstName: 'Foo',
          },
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitPersonalInfoUpdate).toHaveBeenCalledTimes(1);
      });

      it('calls submitAddressUpdate if changedAddress is true', async () => {
        jest.spyOn(wrapper.vm, 'submitAddressUpdate').mockImplementation(() => {});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({
          backupAddress: {
            ...householdCreate.primaryBeneficiary.currentAddress,
            address: { ...householdCreate.primaryBeneficiary.currentAddress.address, unitSuite: '999' },
          },
        });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.submitAddressUpdate).toHaveBeenCalledTimes(1);
      });

      it('emits close', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });

    describe('setCurrentAddress', () => {
      it('calls the mutation setCurrentAddress ', async () => {
        const address = householdCreate.primaryBeneficiary.currentAddress;
        await wrapper.vm.setCurrentAddress(address);
        expect(storage.registration.mutations.setCurrentAddress).toHaveBeenCalledWith(address);
      });
    });

    describe('submitAddressUpdate', () => {
      it('calls the action updatePersonAddress ', async () => {
        await wrapper.vm.submitAddressUpdate();
        expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledWith(
          { member: wrapper.vm.member, isPrimaryMember: true },
        );
      });

      it('calls the updateAdditionalMembersWithSameAddress method', async () => {
        jest.spyOn(wrapper.vm, 'updateAdditionalMembersWithSameAddress').mockImplementation(() => {});
        await wrapper.vm.submitAddressUpdate();
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitPersonalInfoUpdate', () => {
      it('calls the action updatePersonIdentity ', async () => {
        await wrapper.vm.submitPersonalInfoUpdate();
        expect(storage.registration.actions.updatePersonIdentity).toHaveBeenCalledWith({ member: wrapper.vm.member, isPrimaryMember: true });
      });

      it('calls the updatePersonContactInformation action', async () => {
        await wrapper.vm.submitPersonalInfoUpdate();
        expect(storage.registration.actions.updatePersonContactInformation)
          .toHaveBeenCalledWith({ member: wrapper.vm.member, isPrimaryMember: true });
      });
    });

    describe('updateAdditionalMembersWithSameAddress', () => {
      it('calls the service updatePersonAddress for each additional member that has the same address as the primary member', async () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },
          computed: {
            member() { return householdCreate.primaryBeneficiary; },
            additionalMembers() {
              return [
                { ...mockMember({ id: '1' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress },
                { ...mockMember({ id: '2' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress },
                {
                  ...mockMember({ id: '3' }),
                  currentAddress: {
                    ...householdCreate.primaryBeneficiary.currentAddress,
                    address: { ...householdCreate.primaryBeneficiary.currentAddress.address, unitSuite: '999' },
                  },
                },
              ];
            },
          },
          mocks: { $storage: storage },
        });

        await wrapper.vm.updateAdditionalMembersWithSameAddress();
        expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledTimes(2);
        expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledWith({
          member: { ...mockMember({ id: '1' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress },
          isPrimaryMember: false,
          index: 0,
          sameAddress: true,
        });
        expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledWith({
          member: { ...mockMember({ id: '2' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress },
          isPrimaryMember: false,
          index: 1,
          sameAddress: true,
        });
      });
    });
  });
});
