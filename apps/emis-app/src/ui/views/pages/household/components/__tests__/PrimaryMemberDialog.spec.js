import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockHouseholdCreate, mockIdentitySetData, ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import libHelpers from '@libs/entities-lib/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';

import { mockStorage } from '@/storage';

import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { EEventLocationStatus } from '@libs/entities-lib/event';
import Component from '../PrimaryMemberDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };

const setCurrentAddress = jest.fn();

householdCreate.additionalMembers = [
  { ...mockMember({ id: '1' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress, setCurrentAddress },
  { ...mockMember({ id: '2' }), currentAddress: householdCreate.primaryBeneficiary.currentAddress, setCurrentAddress },
  {
    ...mockMember({ id: '3' }),
    currentAddress: {
      ...householdCreate.primaryBeneficiary.currentAddress,
      address: { ...householdCreate.primaryBeneficiary.currentAddress.address, unitSuite: '999', setCurrentAddress },
    },
  },
];

describe('PrimaryMemberDialog', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);
  storage.registration.getters.personalInformation = jest.fn(() => mockIdentitySetData());

  libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);

  const mockAddressTypes = [
    { value: ECurrentAddressTypes.Campground, text: 'Campground' },
    { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  ];
  helpers.enumToTranslatedCollection = jest.fn(() => mockAddressTypes);

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should store the identity set data  into backupIdentitySet', async () => {
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
        expect(wrapper.vm.backupIdentitySet).toEqual(householdCreate.primaryBeneficiary.identitySet);
      });

      it('should store the contact info into backupContactInfo', async () => {
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
        expect(wrapper.vm.backupContactInfo).toEqual(householdCreate.primaryBeneficiary.contactInformation);
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

    describe('changedIdentitySet', () => {
      it('returns false if the personal info and the backup info are the same', async () => {
        await wrapper.setData({ backupIdentitySet: householdCreate.primaryBeneficiary.identitySet });
        expect(wrapper.vm.changedIdentitySet).toBeFalsy();
      });

      it('returns true if the personal info and the backup info are not the same', async () => {
        await wrapper.setData({
          backupIdentitySet: {
            ...mockIdentitySetData(),
            firstName: 'Foo',
          },
        });
        expect(wrapper.vm.changedIdentitySet).toBeTruthy();
      });
    });

    describe('changedContactInfo', () => {
      it('returns false if the personal contact info and the backup contact info are the same', async () => {
        await wrapper.setData({ backupContactInfo: householdCreate.primaryBeneficiary.contactInformation });
        expect(wrapper.vm.changedContactInfo).toBeFalsy();
      });

      it('returns true if the personal info and the backup info are not the same', async () => {
        await wrapper.setData({
          backupContactInfo: {
            ...householdCreate.primaryBeneficiary.contactInformation,
            email: 'foo@bar.com',
          },
        });
        expect(wrapper.vm.changedContactInfo).toBeTruthy();
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the full list of temporary addresses types', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [{ status: EEventLocationStatus.Active }],
          },
          data() {
            return {
              apiKey: '123',
            };
          },
        });

        expect(wrapper.vm.currentAddressTypeItems).toEqual(mockAddressTypes);
      });

      it('excludes shelter', async () => {
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
        });

        expect(wrapper.vm.currentAddressTypeItems).toEqual([{ value: ECurrentAddressTypes.Campground, text: 'Campground' }]);
      });
    });

    describe('title', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.title).toEqual('household.details.edit.title');
      });
    });

    describe('member', () => {
      it('returns the primaryBeneficiary when no id passed', () => {
        expect(wrapper.vm.member).toEqual(householdCreate.primaryBeneficiary);
      });
    });

    describe('member', () => {
      it('returns the member of the right id when id passed', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
            memberId: householdCreate.primaryBeneficiary.id,
          },
          data() {
            return { apiKey: '123' };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.member).toEqual(householdCreate.primaryBeneficiary);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
            memberId: householdCreate.additionalMembers[0].id,
          },
          data() {
            return { apiKey: '123' };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.member).toEqual(householdCreate.additionalMembers[0]);
      });
    });

    describe('additionalMembers', () => {
      it('returns the other members', () => {
        expect(wrapper.vm.additionalMembers).toEqual(householdCreate.additionalMembers);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
            memberId: householdCreate.additionalMembers[0].id,
          },
          data() {
            return { apiKey: '123' };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.additionalMembers).toEqual([householdCreate.primaryBeneficiary,
          householdCreate.additionalMembers[1], householdCreate.additionalMembers[2]]);
      });
    });

    describe('submitButtonDisabled', () => {
      it('returns true if failed is true', async () => {
        expect(wrapper.vm.submitButtonDisabled(true, false)).toBeTruthy();
      });

      it('returns true if pristine is true, changedAddress is false and makePrimaryMode is false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
            makePrimaryMode: false,
          },
          data() {
            return {
              apiKey: '123',
            };
          },
          computed: {
            changedAddress() {
              return false;
            },
          },
        });

        expect(wrapper.vm.submitButtonDisabled(false, true)).toBeTruthy();
      });

      it('returns true if submitLoading is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return {
              apiKey: '123',
              submitLoading: true,
            };
          },
          computed: {
            changedAddress() {
              return false;
            },
          },
        });

        expect(wrapper.vm.submitButtonDisabled(false, false)).toBeTruthy();
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return {
              apiKey: '123',
              submitLoading: true,
            };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return {
              apiKey: '123',
              submitLoading: true,
            };
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
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
        mocks: { $storage: storage },
      });
    });

    describe('onCancel', () => {
      it('emits close', async () => {
        await wrapper.vm.onCancel();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });

    describe('validateEmailAndSubmit', () => {
      it('calls eventhub with the right arguments', async () => {
        EventHub.$emit = jest.fn();
        await wrapper.vm.validateEmailAndSubmit();
        expect(EventHub.$emit).toHaveBeenCalledWith('checkEmailValidation', wrapper.vm.onSubmit);
      });
    });

    describe('onSubmit', () => {
      it('Submit calls validate method', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls updatePersonIdentity action if changedIdentitySet is true', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({
          backupIdentitySet: {
            ...mockIdentitySetData(),
            firstName: 'Foo',
          },
        });
        await wrapper.vm.onSubmit();
        expect(storage.registration.actions.updatePersonIdentity).toHaveBeenCalledWith({ member: wrapper.vm.member, isPrimaryMember: true });
      });

      it('calls updatePersonContactInformation action if changedContactInfo is true', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({
          backupContactInfo: {
            ...householdCreate.primaryBeneficiary.contactInformation,
            email: 'foo@bar.com',
          },
        });
        await wrapper.vm.onSubmit();
        expect(storage.registration.actions.updatePersonContactInformation)
          .toHaveBeenCalledWith({ member: wrapper.vm.member, isPrimaryMember: true });
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

      it('calls the makePrimary service and the setIsPrivacyAgreed mutation if makePrimaryMode is true', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            shelterLocations: [],
            makePrimaryMode: true,
          },
          data() {
            return { apiKey: '123', member: mockMember() };
          },
          mocks: { $storage: storage },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$services.households.makePrimary)
          .toHaveBeenCalledWith(householdCreate.id, wrapper.vm.member.id, householdCreate.consentInformation);
        expect(storage.registration.mutations.setIsPrivacyAgreed).toHaveBeenCalledWith(false);
      });

      it('emits close', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });

    describe('setIdentity', () => {
      it('calls the member setIdentity ', async () => {
        const param = {};
        wrapper.vm.member.identitySet.setIdentity = jest.fn();
        await wrapper.vm.setIdentity(param);
        expect(wrapper.vm.member.identitySet.setIdentity).toHaveBeenCalledWith(param);
      });
    });

    describe('setIndigenousIdentity', () => {
      it('calls the member setIndigenousIdentity ', async () => {
        const param = {};
        wrapper.vm.member.identitySet.setIndigenousIdentity = jest.fn();
        await wrapper.vm.setIndigenousIdentity(param);
        expect(wrapper.vm.member.identitySet.setIndigenousIdentity).toHaveBeenCalledWith(param);
      });
    });

    describe('setContactInformation', () => {
      it('sets the member contactInformation ', async () => {
        const param = {};
        await wrapper.vm.setContactInformation(param);
        expect(wrapper.vm.member.contactInformation).toBe(param);
      });
    });

    describe('setCurrentAddress', () => {
      it('calls the member setCurrentAddress ', async () => {
        const param = {};
        wrapper.vm.member.setCurrentAddress = jest.fn();
        await wrapper.vm.setCurrentAddress(param);
        expect(wrapper.vm.member.setCurrentAddress).toHaveBeenCalledWith(param);
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
        jest.spyOn(wrapper.vm, 'updateAdditionalMembersWithSameAddress').mockImplementation(() => []);
        await wrapper.vm.submitAddressUpdate();
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateAdditionalMembersWithSameAddress', () => {
      it(
        'calls the service updatePersonAddress for each additional member that has the same address as the primary member and sets address',
        async () => {
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
            mocks: { $storage: storage },
          });

          await wrapper.vm.updateAdditionalMembersWithSameAddress();
          expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledTimes(2);
          expect(setCurrentAddress).toHaveBeenCalledTimes(2);
          expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledWith({
            member: householdCreate.additionalMembers[0],
            isPrimaryMember: false,
            index: 0,
          });
          expect(storage.registration.actions.updatePersonAddress).toHaveBeenCalledWith({
            member: householdCreate.additionalMembers[1],
            isPrimaryMember: false,
            index: 1,
          });
        },
      );
    });
  });
});
