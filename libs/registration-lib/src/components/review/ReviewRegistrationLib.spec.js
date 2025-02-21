import Vuetify from 'vuetify';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import { RcConfirmationDialog } from '@libs/component-lib/src/components';
import helpers from '@libs/entities-lib/helpers';
import {
  mockHouseholdCreate,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
  mockCampGround, mockIdentitySet, mockAddress, mockAdditionalMember, Member, mockContactInformation, MemberDuplicateStatus,
} from '@libs/entities-lib/household-create';
import { mockUserL6 } from '@libs/entities-lib/src/user';
import AddressesTemplate from './addresses/AddressesTemplate.vue';
import PersonalInformationTemplate from './personal-information/PersonalInformationTemplate.vue';
import Component from './ReviewRegistrationLib.vue';
import { mockProvider } from '../../provider';

const localVue = createLocalVue();
const services = mockProvider();
const vuetify = new Vuetify();

describe('ReviewRegistrationLib.vue', () => {
  let wrapper;
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
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          mocks: {
            $services: services,
          },
          stubs: ['personal-information-template'],
        });
        wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
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
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          stubs: ['personal-information-template'],
        });
        wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
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
        wrapper.vm.submitAddresses = jest.fn();
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
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          stubs: ['personal-information-template', 'validation-observer'],
        });
        wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
      });
      test('edit event calls the correct method', async () => {
        wrapper.vm.editAdditionalMember = jest.fn();
        wrapper.vm.$refs.additionalMember_0 = {
          validate: jest.fn((() => true)),
        };
        const section = wrapper.findDataTest('additionalMember_0');
        section.vm.$emit('edit');
        expect(wrapper.vm.editAdditionalMember).toHaveBeenCalledTimes(1);
      });

      test('cancel event calls the correct method', () => {
        wrapper.vm.cancelAdditionalMember = jest.fn();
        const section = wrapper.findDataTest('additionalMember_0');
        section.vm.$emit('cancel');
        expect(wrapper.vm.cancelAdditionalMember).toHaveBeenCalledTimes(1);
      });

      test('submit event calls the correct method', () => {
        wrapper.vm.submitAdditionalMember = jest.fn();
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
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        vuetify,
        propsData: {
          disableAutocomplete: false,
          user: mockUserL6(),
        },
        mocks: {
          $services: services,
        },
      });
      wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
    });
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
          personalInfoEdit: false,
          tempAddressEdit: false,
          backupIdentity: null,
          backupTempAddress: null,
          loading: false,
          sameAddress: _isEqual(wrapper.vm.additionalMembersCopy[index].currentAddress, wrapper.vm.householdCreate.primaryBeneficiary.currentAddress),
          backupSameAddress: _isEqual(wrapper.vm.additionalMembersCopy[index].currentAddress, wrapper.vm.householdCreate.primaryBeneficiary.currentAddress),
        }));
        wrapper.vm.buildAdditionalMembersState();
        expect(wrapper.vm.additionalMembers).toEqual(expected);
      });
    });

    describe('editPersonalInformation', () => {
      it('should save a backup before editing', () => {
        expect(wrapper.vm.personalInformation.backup).toEqual({ contactInformation: null, identitySet: null });
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.personalInformation.backup.contactInformation).toEqual(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.contactInformation);
        expect(wrapper.vm.personalInformation.backup.identitySet).toEqual(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.identitySet);
      });

      it('should enter inline edit mode', () => {
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(false);
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.personalInformation.inlineEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editPersonalInformation();
        expect(wrapper.vm.$registrationStore.increaseInlineEditCounter).toHaveBeenCalledTimes(1);
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
        expect(wrapper.vm.addresses.currentEdit).toEqual(false);
        expect(wrapper.vm.addresses.currentEdit).toEqual(false);
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.homeEdit).toEqual(true);
        expect(wrapper.vm.addresses.homeEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editAddresses();
        expect(wrapper.vm.$registrationStore.increaseInlineEditCounter).toHaveBeenCalledTimes(2);
      });
    });

    describe('editAdditionalMember', () => {
      it('should set indexAdditionalMember ', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.indexAdditionalMember).toBe(0);
      });

      it('should save a backup for each member before editing', () => {
        expect(wrapper.vm.additionalMembers[0].backupTempAddress).toEqual(null);
        expect(wrapper.vm.additionalMembers[0].backupIdentity).toEqual(null);
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].backupTempAddress).toEqual(wrapper.vm.householdCreate.additionalMembers[0].currentAddress);
        expect(wrapper.vm.additionalMembers[0].backupIdentity).toEqual(wrapper.vm.householdCreate.additionalMembers[0].identitySet);

        // with parameters
        wrapper.vm.additionalMembers[0].backupTempAddress = { somevalue: '' };
        wrapper.vm.additionalMembers[0].backupIdentity = { somevalue: '' };
        wrapper.vm.editAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.additionalMembers[0].backupTempAddress).toEqual({ somevalue: '' });
        expect(wrapper.vm.additionalMembers[0].backupIdentity).toEqual(wrapper.vm.householdCreate.additionalMembers[0].identitySet);

        wrapper.vm.additionalMembers[0].backupTempAddress = { somevalue: '' };
        wrapper.vm.additionalMembers[0].backupIdentity = { somevalue: '' };
        wrapper.vm.editAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.additionalMembers[0].backupTempAddress).toEqual(wrapper.vm.householdCreate.additionalMembers[0].currentAddress);
        expect(wrapper.vm.additionalMembers[0].backupIdentity).toEqual({ somevalue: '' });
      });

      it('should enter inline edit mode for a specific member', () => {
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(false);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(false);
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(true);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(true);

        // with parameters
        wrapper.vm.additionalMembers[0].personalInfoEdit = false;
        wrapper.vm.additionalMembers[0].tempAddressEdit = false;
        wrapper.vm.editAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(true);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(false);

        wrapper.vm.additionalMembers[0].personalInfoEdit = false;
        wrapper.vm.additionalMembers[0].tempAddressEdit = false;
        wrapper.vm.editAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(false);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(true);
      });

      it('should increase inline edit counter', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.$registrationStore.increaseInlineEditCounter).toHaveBeenCalledTimes(2);

        // with parameters
        jest.clearAllMocks();
        wrapper.vm.editAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.$registrationStore.increaseInlineEditCounter).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        wrapper.vm.editAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.$registrationStore.increaseInlineEditCounter).toHaveBeenCalledTimes(1);
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
        wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setPersonalInformation = jest.fn();
        wrapper.vm.editPersonalInformation();
        wrapper.vm.cancelPersonalInformation();
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setPersonalInformation)
          .toHaveBeenCalledWith(wrapper.vm.personalInformation.backup.contactInformation, wrapper.vm.personalInformation.backup.identitySet);
      });

      it('should so nothing if inline mode is not on', () => {
        wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setPersonalInformation = jest.fn();
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setPersonalInformation).toHaveBeenCalledTimes(0);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editPersonalInformation();
        wrapper.vm.cancelPersonalInformation();
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelAdditionalMember', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(true);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(true);
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(false);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(false);

        // with parameters
        wrapper.vm.additionalMembers[0].personalInfoEdit = true;
        wrapper.vm.additionalMembers[0].tempAddressEdit = true;
        wrapper.vm.cancelAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(false);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(true);

        wrapper.vm.additionalMembers[0].personalInfoEdit = true;
        wrapper.vm.additionalMembers[0].tempAddressEdit = true;
        wrapper.vm.cancelAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.additionalMembers[0].personalInfoEdit).toEqual(true);
        expect(wrapper.vm.additionalMembers[0].tempAddressEdit).toEqual(false);
      });

      it('should restore the backup into the store', () => {
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        wrapper.vm.editAdditionalMember(0);
        let member = _cloneDeep(wrapper.vm.additionalMembersCopy[0]);
        wrapper.vm.additionalMembers[0].backupIdentity = { something: 'something ' };
        wrapper.vm.additionalMembers[0].backupTempAddress = { someAddress: 'something ' };
        member.currentAddress = wrapper.vm.additionalMembers[0].backupTempAddress;
        member.identitySet = wrapper.vm.additionalMembers[0].backupIdentity;
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(member, 0, wrapper.vm.additionalMembers[0].backupSameAddress);

        // with parameters
        member = _cloneDeep(wrapper.vm.additionalMembersCopy[0]);
        wrapper.vm.editAdditionalMember(0, 'personalInfo');
        wrapper.vm.additionalMembers[0].backupIdentity = { something: 'something ' };
        wrapper.vm.additionalMembers[0].backupTempAddress = { someAddress: 'something ' };
        member.identitySet = wrapper.vm.additionalMembers[0].backupIdentity;
        wrapper.vm.cancelAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(member, 0, wrapper.vm.additionalMembers[0].backupSameAddress);

        member = _cloneDeep(wrapper.vm.additionalMembersCopy[0]);
        wrapper.vm.editAdditionalMember(0, 'tempAddress');
        wrapper.vm.additionalMembers[0].backupIdentity = { something: 'something ' };
        wrapper.vm.additionalMembers[0].backupTempAddress = { someAddress: 'something ' };
        member.currentAddress = wrapper.vm.additionalMembers[0].backupTempAddress;
        wrapper.vm.cancelAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(member, 0, wrapper.vm.additionalMembers[0].backupSameAddress);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editAdditionalMember(0);
        wrapper.vm.cancelAdditionalMember(0);
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(2);

        // with parameters
        jest.clearAllMocks();
        wrapper.vm.editAdditionalMember(0, 'personalInfo');
        wrapper.vm.cancelAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        wrapper.vm.editAdditionalMember(0, 'tempAddress');
        wrapper.vm.cancelAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancelAddresses', () => {
      it('should close the inline edit mode', () => {
        wrapper.vm.editAddresses();
        expect(wrapper.vm.addresses.currentEdit).toEqual(true);
        expect(wrapper.vm.addresses.homeEdit).toEqual(true);
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.addresses.currentEdit).toEqual(false);
        expect(wrapper.vm.addresses.homeEdit).toEqual(false);

        // with parameters
        wrapper.vm.addresses.currentEdit = true;
        wrapper.vm.addresses.homeEdit = true;
        wrapper.vm.cancelAddresses('current');
        expect(wrapper.vm.addresses.currentEdit).toEqual(false);
        expect(wrapper.vm.addresses.homeEdit).toEqual(true);

        wrapper.vm.addresses.currentEdit = true;
        wrapper.vm.addresses.homeEdit = true;
        wrapper.vm.cancelAddresses('home');
        expect(wrapper.vm.addresses.currentEdit).toEqual(true);
        expect(wrapper.vm.addresses.homeEdit).toEqual(false);
      });

      it('should restore the addresses back up into the store', () => {
        wrapper.vm.$registrationStore.householdCreate.setHomeAddress = jest.fn();
        wrapper.vm.$registrationStore.householdCreate.setCurrentAddress = jest.fn();
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);

        // with parameters
        jest.clearAllMocks();
        wrapper.vm.editAddresses('home');
        wrapper.vm.cancelAddresses('home');
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress).not.toHaveBeenCalled();

        jest.clearAllMocks();
        wrapper.vm.editAddresses('current');
        wrapper.vm.cancelAddresses('current');
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress).not.toHaveBeenCalled();
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress)
          .toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
      });

      it('should decrease inline edit counter', () => {
        wrapper.vm.editAddresses();
        wrapper.vm.cancelAddresses();
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(2);

        // with parameters
        jest.clearAllMocks();
        wrapper.vm.editAddresses('home');
        wrapper.vm.cancelAddresses('home');
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        wrapper.vm.editAddresses('current');
        wrapper.vm.cancelAddresses('current');
        expect(wrapper.vm.$registrationStore.decreaseInlineEditCounter).toHaveBeenCalledTimes(1);
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

      it('should call updatePersonalInformation in applySavesRightAway mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },

          computed: {
            applySavesRightAway: () => true,
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
          true,
          {
            identitySet: wrapper.vm.householdCreate.primaryBeneficiary.identitySet,
            contactInformation: wrapper.vm.householdCreate.primaryBeneficiary.contactInformation,
          },
        );
      });

      it('should setIdentity with backup if updatePersonIdentity failed', async () => {
        wrapper.vm.$services.households.updatePersonIdentity = jest.fn(() => false);
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setIdentity).toHaveBeenCalledWith(wrapper.vm.personalInformation.backup.identitySet);
      });

      it('should always call updatePersonContactInformation with proper params if updatePersonIdentity succeeded ', async () => {
        await wrapper.vm.updatePersonalInformation();
        expect(wrapper.vm.$services.households.updatePersonContactInformation).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          true,
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
        expect(wrapper.vm.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation)
          .toHaveBeenCalledWith(wrapper.vm.personalInformation.backup.contactInformation);
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

      it('should close the inline mode ', async () => {
        expect(wrapper.vm.addresses.homeEdit).toBe(false);
        expect(wrapper.vm.addresses.currentEdit).toBe(false);

        // with parameters
        wrapper.vm.addresses.currentEdit = true;
        wrapper.vm.addresses.homeEdit = true;
        await wrapper.vm.submitAddresses('current');
        expect(wrapper.vm.addresses.currentEdit).toEqual(false);
        expect(wrapper.vm.addresses.homeEdit).toEqual(true);

        wrapper.vm.addresses.currentEdit = true;
        wrapper.vm.addresses.homeEdit = true;
        await wrapper.vm.submitAddresses('home');
        expect(wrapper.vm.addresses.currentEdit).toEqual(true);
        expect(wrapper.vm.addresses.homeEdit).toEqual(false);
      });

      it('should call updateAddresses in applySavesRightAway mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },

          computed: {
            applySavesRightAway: () => true,
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
        wrapper.vm.$registrationStore.householdCreate.setHomeAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      // eslint-disable-next-line vue/max-len
      it('should call updatePersonAddress with proper params and updateAdditionalMembersWithSameAddress if updatePersonIdentity succeeded only if isNewPrimaryCurrentAddress is true', async () => {
        wrapper.vm.updateAdditionalMembersWithSameAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          true,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
        expect(wrapper.vm.updateAdditionalMembersWithSameAddress).toHaveBeenCalled();
      });

      it('should setCurrentAddress with backup if updatePersonAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        wrapper.vm.$registrationStore.householdCreate.setCurrentAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
      });
    });

    describe('updateAdditionalMembersWithSameAddress', () => {
      it('should call service for all members with the same address', async () => {
        await wrapper.setData({ additionalMembers: [
          { ...wrapper.vm.additionalMembers[0], sameAddress: false },
          { ...wrapper.vm.additionalMembers[1], sameAddress: true },
          { ...wrapper.vm.additionalMembers[2], sameAddress: true },
        ] });
        await wrapper.vm.updateAdditionalMembersWithSameAddress();

        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.additionalMembersCopy[1].id,
          true,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.additionalMembersCopy[2].id,
          true,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
      });
    });

    describe('submitAdditionalMember', () => {
      let spy;
      beforeEach(async () => {
        // eslint-disable-next-line no-multi-assign
        spy = wrapper.vm.$refs.additionalMember_0 = [{
          validate: jest.fn(() => true),
        }];
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.submitAdditionalMember(0);
      });

      it('should validate additional member form', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should close the inline mode ', () => {
        expect(spy[0].validate).toHaveBeenCalledTimes(1);
      });

      it('should save the change in the store if this isnt only th current address mode', async () => {
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.additionalMembersCopy[0], 0, wrapper.vm.additionalMembers[0].sameAddress);
      });

      it('should call updateMember in applySavesRightAway mode ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },

          computed: {
            applySavesRightAway: () => true,
          },
        });
        wrapper.vm.$refs.additionalMember_0 = [{
          validate: jest.fn(() => true),
        }];
        wrapper.vm.updateMember = jest.fn();
        await wrapper.vm.submitAdditionalMember(0);
        expect(wrapper.vm.updateMember).toHaveBeenCalledTimes(1);

        // with parameter
        jest.clearAllMocks();
        await wrapper.vm.submitAdditionalMember(0, 'tempAddress');
        expect(wrapper.vm.updateMember).not.toHaveBeenCalled();

        jest.clearAllMocks();
        await wrapper.vm.submitAdditionalMember(0, 'personalInfo');
        expect(wrapper.vm.updateMember).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateAddresses', () => {
      it('should call updateHomeAddress with proper params', async () => {
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updateHomeAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.id,
          true,
          wrapper.vm.householdCreate.homeAddress,
        );
      });

      it('should setHomeAddress with backup with updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updateHomeAddress = jest.fn(() => false);
        wrapper.vm.$registrationStore.householdCreate.setHomeAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$registrationStore.householdCreate.setHomeAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupHomeAddress);
      });

      it('should call updatePersonContactInformation with proper params if updatePersonIdentity succeeded', async () => {
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
          wrapper.vm.householdCreate.primaryBeneficiary.id,
          true,
          wrapper.vm.householdCreate.primaryBeneficiary.currentAddress,
        );
      });

      it('should setCurrentAddress with backup with updatePersonAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        wrapper.vm.$registrationStore.householdCreate.setCurrentAddress = jest.fn();
        await wrapper.vm.updateAddresses();
        expect(wrapper.vm.$registrationStore.householdCreate.setCurrentAddress).toHaveBeenCalledWith(wrapper.vm.addresses.backupCurrentAddress);
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
        wrapper.vm.$registrationStore.householdCreate.removeAdditionalMember = jest.fn();
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.$registrationStore.householdCreate.removeAdditionalMember).toHaveBeenLastCalledWith(wrapper.vm.indexAdditionalMember);
      });

      it('should set showDeleteDialog to false', () => {
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.showAdditionalMemberDelete).toEqual(false);
      });

      it('should call deleteAdditionalMember in applySavesRightAway mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },

          computed: {
            applySavesRightAway: () => true,
          },
        });
        await wrapper.setData({ indexAdditionalMember: 0 });

        await wrapper.vm.deleteAdditionalMember();

        expect(wrapper.vm.$registrationStore.deleteAdditionalMember)
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
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
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
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(
            wrapper.vm.currentAdditionalMember,
            0,
            wrapper.vm.additionalMembers[0].sameAddress,
          );
      });
    });

    describe('setCurrentAddress', () => {
      it('set temporary address of the additional member', async () => {
        await wrapper.setData({
          indexAdditionalMember: 0,
        });
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.setCurrentAddress(mockCampGround());
        expect(wrapper.vm.currentAdditionalMember.currentAddress).toEqual(mockCampGround());
      });

      it('should save the new additional member in the store', async () => {
        wrapper.setData({
          indexAdditionalMember: 0,
        });
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.setCurrentAddress(mockCampGround());
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
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
        expect(wrapper.vm.$services.households.updateNoFixedHomeAddress).toHaveBeenCalledWith('123', true);
      });

      it('should call updateHomeAddress if fixed home', async () => {
        await wrapper.vm.updateHomeAddress('123', { noFixedHome: false, homeAddress: mockAddress() });
        expect(wrapper.vm.$services.households.updateHomeAddress).toHaveBeenCalledWith('123', true, mockAddress());
      });
    });

    describe('updateMember', () => {
      it('should always call updatePersonIdentity with proper params', async () => {
        const index = 0;
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => false);
        const member = wrapper.vm.householdCreate.additionalMembers[index];
        await wrapper.vm.updateMember(index);
        expect(wrapper.vm.$services.households.updatePersonIdentity).toHaveBeenCalledWith(
          member.id,
          true,
          { identitySet: member.identitySet, contactInformation: member.contactInformation },
        );
      });

      it('should editAdditionalMember with backup if updateHomeAddress failed', async () => {
        const member = wrapper.vm.householdCreate.additionalMembers[0];
        wrapper.vm.additionalMembers[0].backupIdentity = { something: 'something ' };
        wrapper.vm.additionalMembers[0].backupTempAddress = { someAddress: 'something ' };
        member.currentAddress = wrapper.vm.additionalMembers[0].backupTempAddress;
        member.identitySet = wrapper.vm.additionalMembers[0].backupIdentity;

        wrapper.vm.$services.households.updatePersonIdentity = jest.fn(() => false);
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.updateMember(0);
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember).toHaveBeenCalledWith(
          member,
          0,
          !wrapper.vm.additionalMembers[0].sameAddress,
        );
      });

      it('should call updatePersonAddress only if isNewMemberCurrentAddress is true', async () => {
        const index = 0;
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => true);
        const member = wrapper.vm.householdCreate.additionalMembers[index];
        await wrapper.vm.updateMember(index);
        expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(member.id, true, member.currentAddress);
      });

      it('should editAdditionalMember with backup containing updated identity if updateHomeAddress failed', async () => {
        wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => false);
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        wrapper.vm.isNewMemberCurrentAddress = jest.fn(() => true);

        const backUpWithUpdatedIdentity = wrapper.vm.additionalMembersCopy[0];
        wrapper.vm.additionalMembers[0].backupIdentity = { something: 'something ' };
        wrapper.vm.additionalMembers[0].backupTempAddress = { someAddress: 'something ' };
        backUpWithUpdatedIdentity.currentAddress = wrapper.vm.additionalMembers[0].backupTempAddress;
        backUpWithUpdatedIdentity.identitySet = wrapper.vm.householdCreate.additionalMembers[0].identitySet;

        await wrapper.vm.updateMember(0);
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember).toHaveBeenCalledWith(
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
        wrapper.vm.additionalMembers[0].backupTempAddress = { };
        expect(wrapper.vm.isNewMemberCurrentAddress(0)).toBe(false);
      });

      it('should return true if different address as before', () => {
        wrapper.vm.householdCreate.additionalMembers[0] = {
          currentAddress: {
            new: '',
          },
        };
        wrapper.vm.additionalMembers[0].backupTempAddress = { };
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
            disableAutocomplete: false,
            user: mockUserL6(),
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
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith({ key: 'warning.MAX_ADDITIONAL_MEMBERS_reached', params: [{ x: 15 }] });
      });

      it('should disabled the button add if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
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
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        vuetify,
        propsData: {
          disableAutocomplete: false,
          user: mockUserL6(),
        },
      });
      wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
    });

    describe('saveDisabled', () => {
      it('returns true if duplicateStatusInCurrentHousehold of getPersonalInformation is Duplicate and not in crc registration', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          computed: {
            getPersonalInformation() {
              return { ...mockIdentitySet(), ...mockContactInformation(), duplicateStatusInCurrentHousehold: MemberDuplicateStatus.Duplicate };
            },
          },
        });

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);

        expect(wrapper.vm.saveDisabled).toBeTruthy();
      });
      it('returns true if duplicateStatusInDb of getPersonalInformation is Duplicate and not in crc registration', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          computed: {
            getPersonalInformation() {
              return { ...mockIdentitySet(), ...mockContactInformation(), duplicateStatusInDb: MemberDuplicateStatus.Duplicate };
            },
          },
        });
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);

        expect(wrapper.vm.saveDisabled).toBeTruthy();
      });

      it('returns false if is crc registration', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          computed: {
            getPersonalInformation() {
              return { ...mockIdentitySet(), ...mockContactInformation(), duplicateStatusInDb: MemberDuplicateStatus.Duplicate };
            },
          },
        });

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);

        expect(wrapper.vm.saveDisabled).toBeFalsy();
      });

      it('returns false if duplicateStatusInDb and duplicateStatusInCurrentHousehold of getPersonalInformation are unique', () => {
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            disableAutocomplete: false,
            user: mockUserL6(),
          },
          computed: {
            getPersonalInformation() {
              return { ...mockIdentitySet(),
                ...mockContactInformation(),
                duplicateStatusInDb: MemberDuplicateStatus.Unique,
                duplicateStatusInCurrentHousehold: MemberDuplicateStatus.Unique };
            },
          },
        });

        expect(wrapper.vm.saveDisabled).toBeFalsy();
      });
    });
    describe('additionalMembersCopy', () => {
      it('should return additional members', () => {
        expect(wrapper.vm.additionalMembersCopy).toEqual(wrapper.vm.householdCreate.additionalMembers);
      });
    });

    describe('minAgeRegistration', () => {
      it('returns null on crcregistration', () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        expect(wrapper.vm.minAgeRegistration).toEqual(null);
      });
      it('returns 16 where self registration', () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        expect(wrapper.vm.minAgeRegistration).toEqual(16);
      });
    });

    describe('householdCreate', () => {
      it('should return to householdCreate in the store', () => {
        expect(wrapper.vm.householdCreate).toEqual(mockHouseholdCreate());
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.getCanadianProvincesWithoutOther(wrapper.vm.$i18n));
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        wrapper.vm.$registrationStore.getIndigenousTypesItems = jest.fn(() => mockIndigenousTypesItems());
        await wrapper.setData({
          indexAdditionalMember: 0,
        });
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        wrapper.vm.$registrationStore.getIndigenousCommunitiesItems = jest.fn(() => mockIndigenousCommunitiesItems());
        await wrapper.setData({
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
        expect(wrapper.vm.splitMode).toEqual(wrapper.vm.$registrationStore.isSplitMode());
      });
    });
  });

  describe('Life cycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        vuetify,
        propsData: {
          disableAutocomplete: false,
          user: mockUserL6(),
        },
      });
    });
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
