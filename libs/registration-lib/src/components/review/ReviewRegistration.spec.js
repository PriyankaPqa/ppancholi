import Vuetify from 'vuetify';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import _merge from 'lodash/merge';
import _isEqual from 'lodash/isEqual';
import { RcConfirmationDialog } from '@libs/component-lib/src/components';
import helpers from '@libs/entities-lib/helpers';
import { i18n } from '../../ui/plugins/i18n';
import {
  mockHouseholdCreate,
  mockContactInformation,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
  mockCampGround, mockIdentitySet, mockAddress, mockAdditionalMember, Member,
} from '../../../../entities-lib/src/household-create';
import AddressesTemplate from './addresses/AddressesTemplate.vue';
import PersonalInformationTemplate from './personal-information/PersonalInformationTemplate.vue';
import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const vuetify = new Vuetify();

describe('ReviewRegistration.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        i18n,
        disableAutocomplete: false,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('Personal information', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      test('edit event calls the correct method', async () => {
        wrapper.vm.editPersonalInformation = jest.fn();
        const section = wrapper.findDataTest('personalInformation');
        await section.vm.$emit('edit');
        expect(wrapper.vm.editPersonalInformation).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', async () => {
        jest.spyOn(wrapper.vm, 'cancelPersonalInformation');
        const section = wrapper.findDataTest('personalInformation');
        await section.vm.$emit('cancel');
        expect(wrapper.vm.cancelPersonalInformation).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', async () => {
        jest.spyOn(wrapper.vm, 'validateEmailAndSubmitPersonalInfo');
        wrapper.vm.$refs.personalInfo = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('personalInformation');
        await section.vm.$emit('submit');
        expect(wrapper.vm.validateEmailAndSubmitPersonalInfo).toHaveBeenCalledTimes(1);
      });

      it('renders personal information template if not in inline mode', () => {
        const component = wrapper.findComponent(PersonalInformationTemplate);
        expect(component.exists()).toBeTruthy();
      });
    });

    describe('Addresses', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      test('edit event calls the correct method', async () => {
        wrapper.vm.editAddresses = jest.fn();
        const section = wrapper.findDataTest('addresses');
        await section.vm.$emit('edit');
        expect(wrapper.vm.editAddresses).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', async () => {
        jest.spyOn(wrapper.vm, 'cancelAddresses');
        const section = wrapper.findDataTest('addresses');
        await section.vm.$emit('cancel');
        expect(wrapper.vm.cancelAddresses).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', async () => {
        jest.spyOn(wrapper.vm, 'submitAddresses');
        wrapper.vm.$refs.addresses = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('addresses');
        await section.vm.$emit('submit');
        expect(wrapper.vm.submitAddresses).toHaveBeenCalledTimes(1);
      });

      it('renders addresses template if not in inline mode', () => {
        const component = wrapper.findComponent(AddressesTemplate);
        expect(component.exists()).toBeTruthy();
      });
    });

    describe('Additional members', () => {
      test('edit event calls the correct method', () => {
        wrapper.vm.editAdditionalMember = jest.fn();
        wrapper.vm.$refs.additionalMember_0 = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('additionalMember_0');
        section.vm.$emit('edit');
        expect(wrapper.vm.editAdditionalMember).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'cancelAdditionalMember');
        const section = wrapper.findDataTest('additionalMember_0');
        section.vm.$emit('cancel');
        expect(wrapper.vm.cancelAdditionalMember).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'submitAdditionalMember');
        wrapper.vm.$refs.additionalMember_0 = [{
          validate: jest.fn(() => true),
        }];
        const section = wrapper.findDataTest('additionalMember_0');
        section.vm.$emit('submit');
        expect(wrapper.vm.submitAdditionalMember).toHaveBeenCalledTimes(1);
      });
    });

    describe('Confirmation deletion', () => {
      test('Validating deletion triggers deleteAdditionalMember', async () => {
        wrapper.setData({
          showAdditionalMemberDelete: true,
        });
        await wrapper.vm.$nextTick();
        jest.spyOn(wrapper.vm, 'deleteAdditionalMember');

        const dialog = wrapper.findComponent(RcConfirmationDialog);
        await dialog.vm.$emit('submit');

        expect(wrapper.vm.deleteAdditionalMember).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('cancelAllAdditionalMembers', () => {
      it('should call cancelAdditionalMember for each members', () => {
        jest.spyOn(wrapper.vm, 'cancelAdditionalMember');
        const membersCount = wrapper.vm.additionalMembers.length;
        wrapper.vm.cancelAllAdditionalMembers();
        expect(wrapper.vm.cancelAdditionalMember).toHaveBeenCalledTimes(membersCount);
      });
    });

    describe('buildAdditionalMembersState', () => {
      it('should initialize the state for additional members', () => {
        const membersCount = wrapper.vm.additionalMembers.length;
        const expected = [...new Array(membersCount)].map((_, index) => ({
          inlineEdit: false,
          loading: false,
          backup: null,
          sameAddress: _isEqual(wrapper.vm.additionalMembersCopy[index].currentAddress, wrapper.vm.householdCreate.primaryBeneficiary.currentAddress),
          backupSameAddress: _isEqual(wrapper.vm.additionalMembersCopy[index].currentAddress, wrapper.vm.householdCreate.primaryBeneficiary.currentAddress),
        }));
        wrapper.vm.buildAdditionalMembersState();
        expect(wrapper.vm.additionalMembers).toEqual(expected);
      });
    });

    describe('editPersonalInformation', () => {
      it('should save a backup before editing', () => {
        expect(wrapper.vm.personalInformation.backup).toEqual(null);
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.personalInformation.backup).toEqual(wrapper.vm.getPersonalInformation);
      });

      it('should enter inline edit mode', () => {
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(false);
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.$storage.registration.mutations.increaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('editAddresses', () => {
      it('should save a backup of temporary address before editing', () => {
        expect(wrapper.vm.addresses.backupCurrentAddress).toEqual(null);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.backupCurrentAddress).toEqual(wrapper.vm.householdCreate.primaryBeneficiary.currentAddress);
      });

      it('should save a backup of home address before editing', () => {
        expect(wrapper.vm.addresses.backupHomeAddress).toEqual(null);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.backupHomeAddress).toEqual(wrapper.vm.householdCreate.homeAddress);
      });

      it('should enter inline edit mode', () => {
        expect(wrapper.vm.addresses.inlineEdit).toEqual(false);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.inlineEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editAddresses();
        expect(wrapper.vm.$storage.registration.mutations.increaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('editAdditionalMember', () => {
      it('should set indexAdditionalMember ', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.indexAdditionalMember).toBe(0);
      });

      it('should save a backup for each member before editing', () => {
        expect(wrapper.vm.additionalMembers[0].backup).toEqual(null);
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].backup).toEqual(wrapper.vm.householdCreate.additionalMembers[0]);
      });

      it('should enter inline edit mode for a specific member', () => {
        expect(wrapper.vm.additionalMembers[0].inlineEdit).toEqual(false);
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].inlineEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.$storage.registration.mutations.increaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelPersonalInformation', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(true);
        wrapper.vm.cancelPersonalInformation();
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(false);
      });

      it('should restore the backup into the store', () => {
        wrapper.vm.editPersonalInformation();
        wrapper.vm.cancelPersonalInformation();
        expect(wrapper.vm.$storage.registration.mutations.setPersonalInformation)
          .toHaveBeenCalledWith(wrapper.vm.personalInformation.backup);
      });

      it('should so nothing if inline mode is not on', () => {
        expect(wrapper.vm.$storage.registration.mutations.setPersonalInformation).toHaveBeenCalledTimes(0);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editPersonalInformation();
        wrapper.vm.cancelPersonalInformation();
        expect(wrapper.vm.$storage.registration.mutations.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelAdditionalMember', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].inlineEdit).toEqual(true);
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].inlineEdit).toEqual(false);
      });

      it('should restore the backup into the store', () => {
        wrapper.vm.editAdditionalMember(0);
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.additionalMembers[0].backup, 0, wrapper.vm.additionalMembers[0].backupSameAddress);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editAdditionalMember(0);
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.$storage.registration.mutations.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelAddresses', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.inlineEdit).toEqual(true);
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.addresses.inlineEdit).toEqual(false);
      });

      it('should restore the home address back up into the store', () => {
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setHomeAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      it('should restore the temporary address back up into the store', () => {
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$storage.registration.mutations.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitPersonalInformation', () => {
      let spy;
      beforeEach(async () => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.personalInfo = {
          validate: jest.fn(() => true),
        };
        await wrapper.vm.submitPersonalInformation();
      });

      it('should validate personal information form', () => {
        expect(spy.validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(wrapper.vm.personalInformation.inlineEdit).toBe(false);
      });

      it('should call updatePersonalInformation in association mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            associationMode: () => true,
          },
        });
        wrapper.vm.$refs.personalInfo = {
          validate: jest.fn(() => true),
        };

        wrapper.vm.updatePersonalInformation = jest.fn();
        await wrapper.vm.submitPersonalInformation();
        expect(wrapper.vm.updatePersonalInformation).toHaveBeenCalledTimes(1);
      });
    });

    describe('updatePersonalInformation', () => {
      it('should always call updatePersonIdentity with proper params', async () => {
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$services.households.updatePersonIdentity).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          {
            identitySet: wrapper.vm.householdCreate.primaryBeneficiary.identitySet,
            contactInformation: wrapper.vm.householdCreate.primaryBeneficiary.contactInformation,
          },
        );
      });

      it('should setIdentity with backup if updatePersonIdentity failed', async () => {
        wrapper.vm.$services.households.updatePersonIdentity = jest.fn(() => false);
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$storage.registration.mutations.setIdentity).toHaveBeenCalledWith(wrapper.vm.personalInformation.backup);
      });

      it('should always call updatePersonContactInformation with proper params if updatePersonIdentity succeeded ', async () => {
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$services.households.updatePersonContactInformation).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          {
            identitySet: wrapper.vm.householdCreate.primaryBeneficiary.identitySet,
            contactInformation: wrapper.vm.householdCreate.primaryBeneficiary.contactInformation,
            isPrimaryBeneficiary: true,
          },
        );
      });

      it('should setContactInformation with backup if updatePersonContactInformation failed', async () => {
        wrapper.vm.$services.households.updatePersonContactInformation = jest.fn(() => false);
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$storage.registration.mutations.setContactInformation).toHaveBeenCalledWith(wrapper.vm.personalInformation.backup);
      });
    });

    describe('submitAddresses', () => {
      let spy;
      beforeEach(() => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.addresses = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.submitAddresses();
      });
      it('should validate addresses form', () => {
        expect(spy.validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(wrapper.vm.addresses.inlineEdit).toBe(false);
      });

      it('should call updateAddresses in association mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            associationMode: () => true,
          },
        });
        wrapper.vm.$refs.addresses = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.updateAddresses = jest.fn();
        await wrapper.vm.submitAddresses();
        expect(wrapper.vm.updateAddresses).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateAddresses', () => {
      it('should call updateHomeAddress method with proper params only if isNewHomeAddress is true', async () => {
        wrapper.vm.updateHomeAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.updateHomeAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.id,
          wrapper.vm.householdCreate,
        );
      });

      it('should setHomeAddress with backup if updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updateHomeAddress = jest.fn(() => false);
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setHomeAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      it('should call updatePersonAddress with proper params if updatePersonIdentity succeeded only if isNewPrimaryCurrentAddress is true', async () => {
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
      });

      it('should setCurrentAddress with backup if updatePersonAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
      });
    });

    describe('submitAdditionalMember', () => {
      let spy;
      beforeEach(() => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.additionalMember_0 = [{
          validate: jest.fn(() => true),
        }];
        wrapper.vm.submitAdditionalMember(0);
      });

      it('should validate additional member form', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should save the change in the store', () => {
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.additionalMembersCopy[0], 0, wrapper.vm.additionalMembers[0].sameAddress);
      });

      it('should call updateMember in association mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            associationMode: () => true,
          },
        });
        wrapper.vm.$refs.additionalMember_0 = [{
          validate: jest.fn(() => true),
        }];
        wrapper.vm.updateMember = jest.fn();
        await wrapper.vm.submitAdditionalMember(0);
        expect(wrapper.vm.updateMember).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateMember', () => {
      it('should call updateHomeAddress with proper params', async () => {
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updateHomeAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.id,
          wrapper.vm.householdCreate.homeAddress,
        );
      });

      it('should setHomeAddress with backup with updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updateHomeAddress = jest.fn(() => false);
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setHomeAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      it('should call updatePersonContactInformation with proper params if updatePersonIdentity succeeded ', async () => {
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
      });

      it('should setCurrentAddress with backup with updatePersonAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
      });
    });

    describe('showDeleteDialog', () => {
      it('should set showAdditionalMemberDelete to true ', () => {
        wrapper.vm.showDeleteDialog(0);
        expect(wrapper.vm.showAdditionalMemberDelete).toBe(true);
      });

      it('should set indexAdditionalMember ', () => {
        wrapper.vm.showDeleteDialog(0);
        expect(wrapper.vm.indexAdditionalMember).toBe(0);
      });
    });

    describe('deleteAdditionalMember', () => {
      it('should call removeAdditionalMember mutations with current index', () => {
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.$storage.registration.mutations.removeAdditionalMember).toHaveBeenLastCalledWith(wrapper.vm.indexAdditionalMember);
      });

      it('should set showDeleteDialog to false', () => {
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.showAdditionalMemberDelete).toEqual(false);
      });

      it('should call deleteAdditionalMember in association mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            associationMode: () => true,
          },
        });

        await wrapper.setData({ indexAdditionalMember: 0 });

        await wrapper.vm.deleteAdditionalMember();

        expect(wrapper.vm.$storage.registration.actions.deleteAdditionalMember)
          .toHaveBeenCalled(wrapper.vm.householdCreate.id, wrapper.vm.householdCreate.additionalMembers[0].id, 0);
      });
    });

    describe('setIdentity', () => {
      it('calls setIdentity of the class IdentitySet ', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        jest.spyOn(wrapper.vm.currentAdditionalMember.identitySet, 'setIdentity');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.currentAdditionalMember.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('should save the new identity of additional member in the store', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentAdditionalMember,
            0,
            wrapper.vm.additionalMembers[0].sameAddress,
          );
      });
    });

    describe('setIndigenousIdentity', () => {
      it('calls setIndigenousIdentity of the class Person ', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        jest.spyOn(wrapper.vm.currentAdditionalMember.identitySet, 'setIndigenousIdentity');
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.currentAdditionalMember.identitySet.setIndigenousIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('should save the new identity set of additional member in the store', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentAdditionalMember,
            0,
            wrapper.vm.additionalMembers[0].sameAddress,
          );
      });
    });

    describe('setCurrentAddress', () => {
      it('set temporary address of the additional member', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        await wrapper.vm.setCurrentAddress(mockCampGround());
        expect(wrapper.vm.currentAdditionalMember.currentAddress).toEqual(mockCampGround());
      });

      it('should save the new additional member in the store', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        await wrapper.vm.setCurrentAddress(mockCampGround());
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentAdditionalMember,
            0,
            wrapper.vm.additionalMembers[0].sameAddress,
          );
      });
    });

    describe('updateHomeAddress', () => {
      it('should call updateNoFixedHomeAddress if no fixed home', async () => {
        await wrapper.vm.updateHomeAddress('123', { noFixedHome: true });
        expect(wrapper.vm.$services.households.updateNoFixedHomeAddress).toHaveBeenCalledWith('123');
      });

      it('should call updateHomeAddress if fixed home', async () => {
        await wrapper.vm.updateHomeAddress('123', { noFixedHome: false, homeAddress: mockAddress() });
        expect(wrapper.vm.$services.households.updateHomeAddress).toHaveBeenCalledWith('123', mockAddress());
      });
    });

    describe('updateMember', () => {
      it('should always call updatePersonIdentity with proper params', async () => {
        const index = 0;
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => false);
        const member = wrapper.vm.householdCreate.additionalMembers[index];
        await wrapper.vm.updateMember(index);
        expect(wrapper.vm.$services.households.updatePersonIdentity).toHaveBeenCalledWith(member.id,
          { identitySet: member.identitySet, contactInformation: member.contactInformation });
      });

      it('should editAdditionalMember with backup if updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonIdentity = jest.fn(() => false);
        await wrapper.vm.updateMember(0);
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember).toHaveBeenCalledWith(
          wrapper.vm.additionalMembers[0].backup,
          0,
          !wrapper.vm.additionalMembers[0].sameAddress,
        );
      });

      it('should call updatePersonAddress only if isNewMemberCurrentAddress is true', async () => {
        const index = 0;
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => true);
        const member = wrapper.vm.householdCreate.additionalMembers[index];
        await wrapper.vm.updateMember(index);
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(member.id, member.currentAddress);
      });

      it('should editAdditionalMember with backup containing updated identity if updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => true);
        const backUpWithUpdatedIdentity = {
          ...wrapper.vm.additionalMembers[0].backup,
          identitySet: wrapper.vm.householdCreate.additionalMembers[0].identitySet,
        };
        await wrapper.vm.updateMember(0);
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember).toHaveBeenCalledWith(
          backUpWithUpdatedIdentity,
          0,
          !wrapper.vm.additionalMembers[0].sameAddress,
        );
      });
    });

    describe('isNewMemberCurrentAddress', () => {
      it('should return false if same address as before', () => {
        wrapper.vm.householdCreate.additionalMembers[0] = {
          currentAddress: {},
        };
        wrapper.vm.additionalMembers[0].backup = {
          currentAddress: {},
        };
        expect(wrapper.vm.isNewMemberCurrentAddress(0)).toBe(false);
      });

      it('should return true if different address as before', () => {
        wrapper.vm.householdCreate.additionalMembers[0] = {
          currentAddress: {
            new: '',
          },
        };
        wrapper.vm.additionalMembers[0].backup = {
          currentAddress: {},
        };
        expect(wrapper.vm.isNewMemberCurrentAddress(0)).toBe(true);
      });
    });

    describe('isNewHomeAddress', () => {
      it('should return false if same home address as before', () => {
        wrapper.vm.householdCreate.homeAddress = {};
        wrapper.vm.addresses.backupHomeAddress = {};
        expect(wrapper.vm.isNewHomeAddress()).toBe(false);
      });

      it('should return true if different home address as before', () => {
        wrapper.vm.householdCreate.homeAddress = { new: '' };
        wrapper.vm.addresses.backupHomeAddress = {};
        expect(wrapper.vm.isNewHomeAddress()).toBe(true);
      });
    });

    describe('isNewPrimaryCurrentAddress', () => {
      it('should return false if same current address for primary as before', () => {
        wrapper.vm.householdCreate.primaryBeneficiary.currentAddress = {};
        wrapper.vm.addresses.backupCurrentAddress = {};
        expect(wrapper.vm.isNewPrimaryCurrentAddress()).toBe(false);
      });

      it('should return true if different home address as before', () => {
        wrapper.vm.householdCreate.primaryBeneficiary.currentAddress = { new: '' };
        wrapper.vm.addresses.backupCurrentAddress = {};
        expect(wrapper.vm.isNewPrimaryCurrentAddress()).toBe(true);
      });
    });

    describe('addAdditionalMember', () => {
      it('should set newAdditionalMember to new instance of member', () => {
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.newAdditionalMember).toEqual(new Member());
      });

      it('should set showAddAdditionalMember to true', () => {
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.showAddAdditionalMember).toEqual(true);
      });

      it('should display a warning message if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            householdCreate() {
              return {
                primaryBeneficiary: {},
                additionalMembers: new Array(20).fill(mockAdditionalMember()),
              };
            },
          },
        });
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith('warning.MAX_ADDITIONAL_MEMBERS_reached');
      });

      it('should disabled the button add if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            householdCreate() {
              return {
                primaryBeneficiary: {},
                additionalMembers: new Array(20).fill(mockAdditionalMember()),
              };
            },
          },
        });
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.disabledAddMembers).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    describe('additionalMembersCopy', () => {
      it('should return additional members', () => {
        expect(wrapper.vm.additionalMembersCopy).toEqual(wrapper.vm.householdCreate.additionalMembers);
      });
    });

    describe('householdCreate', () => {
      it('should return to householdCreate in the store', () => {
        expect(wrapper.vm.householdCreate).toEqual(mockHouseholdCreate());
      });
    });

    describe('getPersonalInformation', () => {
      it('should return personalInformation', () => {
        expect(wrapper.vm.getPersonalInformation).toEqual(_merge(mockContactInformation(), mockIdentitySet()));
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(i18n));
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('currentAdditionalMember', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.currentAdditionalMember).toEqual(wrapper.vm.additionalMembersCopy[wrapper.vm.indexAdditionalMember]);
      });
    });

    describe('splitMode', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.splitMode).toEqual(storage.registration.getters.isSplitMode());
      });
    });
  });

  describe('Life cycle', () => {
    describe('Created', () => {
      it('should call buildAdditionalMembersState', () => {
        jest.spyOn(wrapper.vm, 'buildAdditionalMembersState');
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.buildAdditionalMembersState).toHaveBeenCalledTimes(1);
      });
    });

    describe('beforeDestroy', () => {
      beforeEach(() => {
        jest.spyOn(wrapper.vm, 'cancelPersonalInformation');
        jest.spyOn(wrapper.vm, 'cancelAddresses');
        jest.spyOn(wrapper.vm, 'cancelAllAdditionalMembers');

        wrapper.vm.$options.beforeDestroy.forEach((hook) => {
          hook.call(wrapper.vm);
        });
      });

      it('should call cancelPersonalInformation', () => {
        expect(wrapper.vm.cancelPersonalInformation).toHaveBeenCalledTimes(1);
      });

      it('should call cancelAddresses', () => {
        expect(wrapper.vm.cancelAddresses).toHaveBeenCalledTimes(1);
      });

      it('should call cancelAllAdditionalMembers', () => {
        expect(wrapper.vm.cancelAllAdditionalMembers).toHaveBeenCalledTimes(1);
      });
    });
  });
});
