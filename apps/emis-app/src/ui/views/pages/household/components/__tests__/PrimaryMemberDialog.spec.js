import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockHouseholdCreate, mockIdentitySetData, ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import libHelpers from '@libs/entities-lib/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { EEventLocationStatus } from '@libs/entities-lib/event';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';

import { mockProvider } from '@/services/provider';

import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import Component from '../PrimaryMemberDialog.vue';

jest.mock('@libs/registration-lib/components/forms/mixins/useAddresses');
const mockAddressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'RemainingInHome' },
];
useAddresses.mockImplementation(() => ({ getCurrentAddressTypeItems: jest.fn(() => mockAddressTypes) }));

const localVue = createLocalVue();
const services = mockProvider();

const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };
const { pinia, registrationStore } = useMockRegistrationStore();
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

  registrationStore.getHouseholdCreate = jest.fn(() => householdCreate);
  registrationStore.householdCreate.primaryBeneficiary.personalInformation = mockIdentitySetData();

  libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should store the identity set data into backupIdentitySet', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },

        });
        expect(wrapper.vm.backupIdentitySet).toEqual(householdCreate.primaryBeneficiary.identitySet);
      });

      it('should store the contact info into backupContactInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },

        });
        expect(wrapper.vm.backupContactInfo).toEqual(householdCreate.primaryBeneficiary.contactInformation);
      });

      it('should save the currentAddress into backupAddress', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
          },
          data() {
            return { apiKey: '123' };
          },

        });

        expect(wrapper.vm.backupAddress).toEqual(householdCreate.primaryBeneficiary.currentAddress);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          shelterLocations: [],
        },
        data() {
          return { apiKey: '123' };
        },

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
          pinia,
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

        });

        expect(wrapper.vm.changedAddress).toBeFalsy();
      });

      it('returns true if the address and the backup address are not the same if flag is off', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          featureList: [wrapper.vm.$featureKeys.CaseFileIndividual],
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

        expect(wrapper.vm.changedAddress).toBeFalsy();
      });
    });

    describe('changedIdentitySet', () => {
      it('returns false if the personal info and the backup info are the same', async () => {
        await wrapper.setData({ backupIdentitySet: householdCreate.primaryBeneficiary.identitySet });
        expect(wrapper.vm.changedIdentitySet).toBeFalsy();
      });

      it('returns false if the personal info and the backup info are the same, even if duplicateStatusInCurrentHousehold and duplicateStatusInDb are different', async () => {
        await wrapper.setData({ backupIdentitySet: { ...householdCreate.primaryBeneficiary.identitySet, duplicateStatusInCurrentHousehold: 10, duplicateStatusInDb: 11 } });
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
          pinia,
          propsData: {
            show: true,
            shelterLocations: [{ status: EEventLocationStatus.Active }],
            makePrimaryMode: true,
          },
          data() {
            return {
              apiKey: '123',
            };
          },
        });
        expect(wrapper.vm.currentAddressTypeItems).toEqual(mockAddressTypes);
      });

      it('calls getCurrentAddressTypeItems with the right params ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [{ status: EEventLocationStatus.Active }],
            makePrimaryMode: true,
          },
          data() {
            return {
              apiKey: '123',
            };
          },

        });

        expect(wrapper.vm.getCurrentAddressTypeItems).toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.noFixedHome, true);
      });
    });

    describe('title', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.title).toEqual({ key: 'household.details.edit.title', params: [{ x: 'Bob Smith' }] });
      });
    });

    describe('submitButtonDisabled', () => {
      it('returns true if failed is true', async () => {
        expect(wrapper.vm.submitButtonDisabled(true, false)).toBeTruthy();
      });

      it('returns true if pristine is true, changedAddress is false and makePrimaryMode is false', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
          pinia,
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
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          featureList: [wrapper.vm.$featureKeys.AddressAutoFill],
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
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          shelterLocations: [],
        },
        data() {
          return { apiKey: '123' };
        },

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
        expect(registrationStore.updatePersonIdentity).toHaveBeenCalledWith({ member: wrapper.vm.member, isPrimaryMember: true });
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
        expect(registrationStore.updatePersonContactInformation)
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
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
            makePrimaryMode: true,
          },
          data() {
            return { apiKey: '123', member: mockMember() };
          },
          mocks: {
            $services: services,
          },

        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$services.households.makePrimary)
          .toHaveBeenCalledWith(householdCreate.id, wrapper.vm.member.id, householdCreate.consentInformation);
        expect(registrationStore.isPrivacyAgreed).toEqual(false);
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
        expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith(
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
            pinia,
            propsData: {
              show: true,
              shelterLocations: [],
            },
            data() {
              return { apiKey: '123' };
            },

          });

          await wrapper.vm.updateAdditionalMembersWithSameAddress();
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledTimes(2);
          expect(setCurrentAddress).toHaveBeenCalledTimes(2);
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({
            member: householdCreate.additionalMembers[0],
            isPrimaryMember: false,
            index: 0,
          });
          expect(registrationStore.updatePersonAddress).toHaveBeenCalledWith({
            member: householdCreate.additionalMembers[1],
            isPrimaryMember: false,
            index: 1,
          });
        },
      );
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          show: true,
          shelterLocations: [],
        },
        data() {
          return { apiKey: '123' };
        },

      });
    });
    describe('current-address-form', () => {
      it('should not exist makePrimaryMode is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
            makePrimaryMode: false,
          },
          data() {
            return { apiKey: '123' };
          },
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        expect(component.exists()).toBeFalsy();
      });

      it('should exist makePrimaryMode is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            show: true,
            shelterLocations: [],
            makePrimaryMode: true,
          },
          data() {
            return { apiKey: '123' };
          },
        });
        const component = wrapper.findComponent(CurrentAddressForm);
        expect(component.exists()).toBeTruthy();
      });
    });
  });
});
