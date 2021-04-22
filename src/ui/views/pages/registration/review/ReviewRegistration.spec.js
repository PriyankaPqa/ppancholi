import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import PersonalInformationTemplate
  from '@/ui/views/pages/registration/review/personal-information/PersonalInformationTemplate.vue';
import AddressesTemplate from '@/ui/views/pages/registration/review/addresses/AddressesTemplate.vue';
import { mockStorage } from '@/store/storage';
import {
  mockBeneficiary,
  mockContactInformation,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
  mockPerson,
} from '@crctech/registration-lib';
import _merge from 'lodash/merge';
import _isEqual from 'lodash/isEqual';
import { RcConfirmationDialog } from '@crctech/component-library';
import { enumToTranslatedCollection } from '@/ui/utils';
import { ECanadaProvinces } from '@/types';
import Component from './ReviewRegistration.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('ReviewRegistration.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
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
      test('edit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'editPersonalInformation');
        const section = wrapper.findDataTest('personalInformation');
        section.vm.$emit('edit');
        expect(wrapper.vm.editPersonalInformation).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'cancelPersonalInformation');
        const section = wrapper.findDataTest('personalInformation');
        section.vm.$emit('cancel');
        expect(wrapper.vm.cancelPersonalInformation).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'submitPersonalInformation');
        wrapper.vm.$refs.personalInfo = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('personalInformation');
        section.vm.$emit('submit');
        expect(wrapper.vm.submitPersonalInformation).toHaveBeenCalledTimes(1);
      });

      it('renders personal information template if not in inline mode', () => {
        const component = wrapper.findComponent(PersonalInformationTemplate);
        expect(component.exists()).toBeTruthy();
      });
    });

    describe('Addresses', () => {
      test('edit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'editAddresses');
        const section = wrapper.findDataTest('addresses');
        section.vm.$emit('edit');
        expect(wrapper.vm.editAddresses).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'cancelAddresses');
        const section = wrapper.findDataTest('addresses');
        section.vm.$emit('cancel');
        expect(wrapper.vm.cancelAddresses).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'submitAddresses');
        wrapper.vm.$refs.addresses = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('addresses');
        section.vm.$emit('submit');
        expect(wrapper.vm.submitAddresses).toHaveBeenCalledTimes(1);
      });

      it('renders addresses template if not in inline mode', () => {
        const component = wrapper.findComponent(AddressesTemplate);
        expect(component.exists()).toBeTruthy();
      });
    });

    describe('Household members', () => {
      test('edit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'editHouseholdMember');
        wrapper.vm.$refs.householdMember_0 = {
          validate: jest.fn(),
        };
        const section = wrapper.findDataTest('householdMember_0');
        section.vm.$emit('edit');
        expect(wrapper.vm.editHouseholdMember).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'cancelHouseholdMember');
        const section = wrapper.findDataTest('householdMember_0');
        section.vm.$emit('cancel');
        expect(wrapper.vm.cancelHouseholdMember).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', () => {
        jest.spyOn(wrapper.vm, 'submitHouseholdMember');
        wrapper.vm.$refs.householdMember_0 = [{
          validate: jest.fn(() => true),
        }];
        const section = wrapper.findDataTest('householdMember_0');
        section.vm.$emit('submit');
        expect(wrapper.vm.submitHouseholdMember).toHaveBeenCalledTimes(1);
      });
    });

    describe('Confirmation deletion', () => {
      test('Validating deletion triggers deleteHouseholdMember', async () => {
        wrapper.setData({
          showHouseholdMemberDelete: true,
        });
        await wrapper.vm.$nextTick();
        jest.spyOn(wrapper.vm, 'deleteHouseholdMember');

        const dialog = wrapper.findComponent(RcConfirmationDialog);
        await dialog.vm.$emit('submit');

        expect(wrapper.vm.deleteHouseholdMember).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('cancelAllHouseholdMembers', () => {
      it('should call cancelHouseholdMember for each members', () => {
        jest.spyOn(wrapper.vm, 'cancelHouseholdMember');
        const membersCount = wrapper.vm.householdMembers.length;
        wrapper.vm.cancelAllHouseholdMembers();
        expect(wrapper.vm.cancelHouseholdMember).toHaveBeenCalledTimes(membersCount);
      });
    });

    describe('buildHouseholdMembersState', () => {
      it('should initialize the state for household members', () => {
        const membersCount = wrapper.vm.householdMembers.length;
        const expected = [...new Array(membersCount)].map((_, index) => ({
          inlineEdit: false,
          backup: null,
          sameAddress: _isEqual(wrapper.vm.householdMembersCopy[index].temporaryAddress, wrapper.vm.beneficiary.person.temporaryAddress),
        }));
        wrapper.vm.buildHouseholdMembersState();
        expect(wrapper.vm.householdMembers).toEqual(expected);
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
    });

    describe('editAddresses', () => {
      it('should save a backup of temporary address before editing', () => {
        expect(wrapper.vm.addresses.backupTemporaryAddress).toEqual(null);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.backupTemporaryAddress).toEqual(wrapper.vm.beneficiary.person.temporaryAddress);
      });

      it('should save a backup of home address before editing', () => {
        expect(wrapper.vm.addresses.backupHomeAddress).toEqual(null);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.backupHomeAddress).toEqual(wrapper.vm.beneficiary.homeAddress);
      });

      it('should enter inline edit mode', () => {
        expect(wrapper.vm.addresses.inlineEdit).toEqual(false);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.inlineEdit).toEqual(true);
      });
    });

    describe('editHouseholdMember', () => {
      it('should set indexHouseholdMember ', () => {
        wrapper.vm.editHouseholdMember(0);
        expect(wrapper.vm.indexHouseholdMember).toBe(0);
      });

      it('should save a backup for each member before editing', () => {
        expect(wrapper.vm.householdMembers[0].backup).toEqual(null);
        wrapper.vm.editHouseholdMember(0);
        expect(wrapper.vm.householdMembers[0].backup).toEqual(wrapper.vm.beneficiary.householdMembers[0]);
      });

      it('should enter inline edit mode for a specific member', () => {
        expect(wrapper.vm.householdMembers[0].inlineEdit).toEqual(false);
        wrapper.vm.editHouseholdMember(0);
        expect(wrapper.vm.householdMembers[0].inlineEdit).toEqual(true);
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
        expect(wrapper.vm.$storage.beneficiary.mutations.setPersonalInformation)
          .toHaveBeenCalledWith(wrapper.vm.personalInformation.backup);
      });

      it('should so nothing if inline mode is not on', () => {
        expect(wrapper.vm.$storage.beneficiary.mutations.setPersonalInformation).toHaveBeenCalledTimes(0);
      });
    });

    describe('cancelHouseholdMember', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editHouseholdMember(0);
        expect(wrapper.vm.householdMembers[0].inlineEdit).toEqual(true);
        wrapper.vm.cancelHouseholdMember(0);
        expect(wrapper.vm.householdMembers[0].inlineEdit).toEqual(false);
      });

      it('should restore the backup into the store', () => {
        wrapper.vm.editHouseholdMember(0);
        wrapper.vm.cancelHouseholdMember(0);
        expect(wrapper.vm.$storage.beneficiary.mutations.editHouseholdMember)
          .toHaveBeenCalledWith(wrapper.vm.householdMembers[0].backup, 0, wrapper.vm.householdMembers[0].sameAddress);
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
        expect(wrapper.vm.$storage.beneficiary.mutations.setHomeAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      it('should restore the temporary address back up into the store', () => {
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$storage.beneficiary.mutations.setTemporaryAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupTemporaryAddress);
      });
    });

    describe('submitPersonalInformation', () => {
      let spy;
      beforeEach(() => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.personalInfo = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.submitPersonalInformation();
      });
      it('should validate personal information form', () => {
        expect(spy.validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(wrapper.vm.personalInformation.inlineEdit).toBe(false);
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
    });

    describe('submitHouseholdMember', () => {
      let spy;
      beforeEach(() => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.householdMember_0 = [{
          validate: jest.fn(() => true),
        }];
        wrapper.vm.submitHouseholdMember(0);
      });

      it('should validate household member form', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should save the change in the store', () => {
        expect(wrapper.vm.$storage.beneficiary.mutations.editHouseholdMember)
          .toHaveBeenCalledWith(wrapper.vm.householdMembersCopy[0], 0, wrapper.vm.householdMembers[0].sameAddress);
      });
    });

    describe('showDeleteDialog', () => {
      it('should set showHouseholdMemberDelete to true ', () => {
        wrapper.vm.showDeleteDialog(0);
        expect(wrapper.vm.showHouseholdMemberDelete).toBe(true);
      });

      it('should set indexHouseholdMember ', () => {
        wrapper.vm.showDeleteDialog(0);
        expect(wrapper.vm.indexHouseholdMember).toBe(0);
      });
    });

    describe('deleteHouseholdMember', () => {
      it('should call removeHouseholdMember mutations with current index', () => {
        wrapper.vm.deleteHouseholdMember();
        expect(wrapper.vm.$storage.beneficiary.mutations.removeHouseholdMember).toHaveBeenLastCalledWith(wrapper.vm.indexHouseholdMember);
      });

      it('should set showDeleteDialog to false', () => {
        wrapper.vm.deleteHouseholdMember();
        expect(wrapper.vm.showHouseholdMemberDelete).toEqual(false);
      });
    });

    describe('onIndigenousProvinceChange', () => {
      it('dispatches the action to fetch indigenous identities by province', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
    });

    describe('setIdentity', () => {
      it('calls setIdentity of the class Person ', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        jest.spyOn(wrapper.vm.currentHouseholdMember, 'setIdentity');
        await wrapper.vm.setIdentity(mockPerson());
        expect(wrapper.vm.currentHouseholdMember.setIdentity).toHaveBeenCalledWith(mockPerson());
      });

      it('should save the new household member in the store', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        await wrapper.vm.setIdentity(mockPerson());
        expect(wrapper.vm.$storage.beneficiary.mutations.editHouseholdMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentHouseholdMember,
            0,
            wrapper.vm.householdMembers[0].sameAddress,
          );
      });
    });

    describe('setIndigenousIdentity', () => {
      it('calls setIndigenousIdentity of the class Person ', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        jest.spyOn(wrapper.vm.currentHouseholdMember, 'setIndigenousIdentity');
        await wrapper.vm.setIndigenousIdentity(mockPerson());
        expect(wrapper.vm.currentHouseholdMember.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
      });

      it('should save the new household member in the store', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        await wrapper.vm.setIndigenousIdentity(mockPerson());
        expect(wrapper.vm.$storage.beneficiary.mutations.editHouseholdMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentHouseholdMember,
            0,
            wrapper.vm.householdMembers[0].sameAddress,
          );
      });
    });
  });

  describe('Computed', () => {
    describe('householdMembersCopy', () => {
      it('should return beneficiary household members', () => {
        expect(wrapper.vm.householdMembersCopy).toEqual(wrapper.vm.beneficiary.householdMembers);
      });
    });

    describe('beneficiary', () => {
      it('should return to beneficiary in the store', () => {
        expect(wrapper.vm.beneficiary).toEqual(mockBeneficiary());
      });
    });

    describe('getPersonalInformation', () => {
      it('should return personalInformation', () => {
        expect(wrapper.vm.getPersonalInformation).toEqual(_merge(mockContactInformation(), mockPerson()));
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        wrapper.setData({
          indexHouseholdMember: 0,
        });
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('currentHouseholdMember', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.currentHouseholdMember).toEqual(wrapper.vm.householdMembersCopy[wrapper.vm.indexHouseholdMember]);
      });
    });
  });

  describe('Life cycle', () => {
    describe('Created', () => {
      it('should call buildHouseholdMembersState', () => {
        jest.spyOn(wrapper.vm, 'buildHouseholdMembersState');
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.buildHouseholdMembersState).toHaveBeenCalledTimes(1);
      });
    });

    describe('beforeDestroy', () => {
      beforeEach(() => {
        jest.spyOn(wrapper.vm, 'cancelPersonalInformation');
        jest.spyOn(wrapper.vm, 'cancelAddresses');
        jest.spyOn(wrapper.vm, 'cancelAllHouseholdMembers');

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

      it('should call cancelAllHouseholdMembers', () => {
        expect(wrapper.vm.cancelAllHouseholdMembers).toHaveBeenCalledTimes(1);
      });
    });
  });
});
