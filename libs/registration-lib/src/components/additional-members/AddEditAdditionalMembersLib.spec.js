import { RcDialog } from '@libs/component-lib/src/components';
import { i18n } from '@/ui/plugins/i18n';
import helpers from '@libs/entities-lib/helpers';
import { EOptionItemStatus } from '@libs/shared-lib/types';
import { mockEvent } from '@libs/entities-lib/src/registration-event';
import {
  ECurrentAddressTypes,
  mockCampGround,
} from '@libs/entities-lib/src/value-objects/current-address';
import { mockAdditionalMember } from '@libs/entities-lib/value-objects/member';
import { mockIdentitySet } from '@libs/entities-lib/value-objects/identity-set';
import { mockAddress, mockHouseholdCreate } from '@libs/entities-lib/household-create';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MemberDuplicateStatus } from '@libs/entities-lib/src/household-create';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AddEditAdditionalMembersLib.vue';
import AdditionalMemberForm from './AdditionalMemberForm.vue';

const localVue = createLocalVue();
const householdId = '4113a553-13ed-41da-a692-f39c934bee05';

describe('AddEditAdditionalMembersLib.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        member: mockAdditionalMember(),
        index: -1,
        i18n,
        householdId,
        disableAutocomplete: false,
      },
      data() {
        return {
          apiKey: 'google-key',
        };
      },
    });
    wrapper.vm.$registrationStore.householdCreate = mockHouseholdCreate();
  });

  describe('Computed', () => {
    describe('sameAddressChanged', () => {
      it('return true if same address is not same as backupaddress', async () => {
        await wrapper.setData({ sameAddress: true, backupSameAddress: false });
        expect(wrapper.vm.sameAddressChanged).toBeTruthy();
      });
      it('return false if same address is  same as backupaddress', async () => {
        await wrapper.setData({ sameAddress: true, backupSameAddress: true });
        expect(wrapper.vm.sameAddressChanged).toBeFalsy();
      });
    });

    describe('primaryBeneficiaryAddress', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.primaryBeneficiaryAddress).toEqual(mockCampGround());
      });
    });

    describe('editMode', () => {
      it('return true if index is different than -1', async () => {
        await wrapper.setProps({ index: 0 });
        expect(wrapper.vm.editMode).toBe(true);
      });
      it('return false if index is -1', () => {
        expect(wrapper.vm.editMode).toBe(false);
      });
    });

    describe('getTitle', () => {
      it('return correct title for editMode', async () => {
        await wrapper.setProps({ index: 0 });
        expect(wrapper.vm.getTitle).toBe('registration.household_member.edit.title');
      });
      it('return correct title for addMode', async () => {
        await wrapper.setProps({ index: 0 - 1 });
        expect(wrapper.vm.getTitle).toBe('registration.household_member.add.title');
      });

      it('returns the right value when in Household profile', async () => {
        await wrapper.setProps({ submitChangesToService: true, index: 0 });
        expect(wrapper.vm.getTitle).toEqual({ key: 'household.details.edit.title', params: [{ x: 'Bob Smith' }] });
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the full list of temporary addresses types without remaining home', async () => {
        const event = mockEvent();
        wrapper.vm.$registrationStore.getEvent = jest.fn(() => event);
        const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);
        const filtered = list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
        expect(wrapper.vm.currentAddressTypeItems).toEqual(filtered);
      });

      it('returns the full list of temporary addresses types without remaining home and without shelter if no shelter available', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            member: mockAdditionalMember(),
            index: -1,
            i18n,
            householdId,
            disableAutocomplete: false,
          },
          data() {
            return {
              apiKey: 'google-key',
            };
          },
          computed: {
            shelterLocations: () => [],
          },
        });
        const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);
        let filtered = list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
        filtered = filtered.filter((item) => (item.value !== ECurrentAddressTypes.Shelter));
        expect(wrapper.vm.currentAddressTypeItems).toEqual(filtered);
      });
    });

    describe('shelterLocations', () => {
      it('should return the active shelterLocations for the current Event', () => {
        const event = mockEvent();
        wrapper.vm.$registrationStore.getEvent = jest.fn(() => event);
        const filtered = event.shelterLocations.filter((s) => s.status === EOptionItemStatus.Active);
        expect(wrapper.vm.shelterLocations).toEqual(filtered);
        expect(wrapper.vm.shelterLocations.filter((s) => s.status === EOptionItemStatus.Inactive)).toHaveLength(0);
      });
    });

    describe('submitDisabled', () => {
      it('returns true if no form data has changed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            member: mockAdditionalMember(),
            index: -1,
            i18n,
            householdId,
            disableAutocomplete: false,
          },
          data() {
            return {
              apiKey: 'google-key',
              identityChanged: false,
              addressChanged: false,
            };
          },
          computed: {
            sameAddressChanged() {
              return false;
            },
          },
        });

        expect(wrapper.vm.submitDisabled).toEqual(true);
      });

      it('returns true if identity is duplicate and feature flag is on and is not crc registration', async () => {
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        await wrapper.setProps({ member: mockAdditionalMember({ identitySet: { getMemberDuplicateStatus: jest.fn(() => MemberDuplicateStatus.Duplicate) } }) });
        expect(wrapper.vm.submitDisabled).toEqual(true);
      });

      it('returns false if identity is duplicate and feature flag is on and is  crc registration', async () => {
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        await wrapper.setProps({ member: mockAdditionalMember({ identitySet: { getMemberDuplicateStatus: jest.fn(() => MemberDuplicateStatus.Duplicate) } }) });
        expect(wrapper.vm.submitDisabled).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('should update show to false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('validate', () => {
      it('should calls editAdditionalMember with proper params', async () => {
        await wrapper.setProps({ index: 0 });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.vm.validate();
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.memberClone, 0, wrapper.vm.sameAddress);
      });

      it('should calls addAdditionalMember with proper params if submitChangesToService is true', async () => {
        wrapper.setProps({ submitChangesToService: true });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$registrationStore.addAdditionalMember)
          .toHaveBeenCalled();
      });

      it('should call submitChanges if submitChangesToService is true', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm, 'submitChanges').mockImplementation(() => {});
        wrapper.setProps({ submitChangesToService: true, index: 0 });
        await wrapper.vm.validate();
        expect(wrapper.vm.submitChanges).toHaveBeenCalledTimes(1);
      });

      it('should close the dialog', async () => {
        jest.spyOn(wrapper.vm, 'close');
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitChanges', () => {
      it('should call the updatePersonAddress action if address changed', async () => {
        await wrapper.setData({ addressChanged: true });
        await wrapper.vm.submitChanges();
        expect(wrapper.vm.$registrationStore.updatePersonAddress).toHaveBeenCalledWith(
          {
            member: wrapper.vm.memberClone, isPrimaryMember: false, index: wrapper.vm.index, sameAddress: wrapper.vm.sameAddress,
          },
        );
      });

      it('should call cancel if the call to the updatePersonAddress action fails', async () => {
        jest.spyOn(wrapper.vm, 'cancel').mockImplementation(() => {});
        wrapper.vm.$registrationStore.updatePersonAddress = jest.fn(() => null);
        await wrapper.setData({ addressChanged: true });
        await wrapper.vm.submitChanges();
        expect(wrapper.vm.cancel).toHaveBeenCalledTimes(1);
      });

      it('should call the updatePersonAddress action if sameAddress changed', async () => {
        await wrapper.setData({ sameAddress: true });
        await wrapper.vm.submitChanges();
        expect(wrapper.vm.$registrationStore.updatePersonAddress).toHaveBeenCalledWith(
          {
            member: wrapper.vm.memberClone, isPrimaryMember: false, index: wrapper.vm.index, sameAddress: wrapper.vm.sameAddress,
          },
        );
      });

      it('should call the updatePersonIdentity action if identity changed ', async () => {
        await wrapper.setData({ identityChanged: true });
        await wrapper.vm.submitChanges();
        expect(wrapper.vm.$registrationStore.updatePersonIdentity).toHaveBeenCalledWith(
          { member: wrapper.vm.memberClone, isPrimaryMember: false, index: wrapper.vm.index },
        );
      });

      it('should call cancel if the call to updatePersonIdentity  fails', async () => {
        jest.spyOn(wrapper.vm, 'cancel').mockImplementation(() => {});
        wrapper.vm.$registrationStore.updatePersonIdentity = jest.fn(() => null);
        await wrapper.setData({ identityChanged: true });
        await wrapper.vm.submitChanges();
        expect(wrapper.vm.cancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('cancel', () => {
      it('should reset household member with the backup', async () => {
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.setProps({ index: 0 });
        await wrapper.vm.cancel();
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.backupPerson, 0, wrapper.vm.backupSameAddress);
      });
    });

    describe('setIdentity', () => {
      it('should be called when identity is changing', () => {
        jest.spyOn(wrapper.vm, 'setIdentity');
        const component = wrapper.findComponent(AdditionalMemberForm);
        component.vm.$emit('identity-change', mockIdentitySet());
        expect(wrapper.vm.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('calls setIdentity of the class IdentitySet ', async () => {
        jest.spyOn(wrapper.vm.memberClone.identitySet, 'setIdentity');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.memberClone.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('calls checkDuplicates if the feature flag is on and it is crc registration', async () => {
        wrapper.vm.checkDuplicates = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.checkDuplicates).toHaveBeenCalledWith(mockIdentitySet());
      });
    });

    describe('setIndigenousIdentity', () => {
      it('should be called when identity is changing', () => {
        jest.spyOn(wrapper.vm, 'setIndigenousIdentity');
        const component = wrapper.findComponent(AdditionalMemberForm);
        component.vm.$emit('indigenous-identity-change', mockIdentitySet());
        expect(wrapper.vm.setIndigenousIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('calls setIndigenousIdentity of the class IdentitySet ', async () => {
        jest.spyOn(wrapper.vm.memberClone.identitySet, 'setIndigenousIdentity');
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.memberClone.identitySet.setIndigenousIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('should call editAdditionalMember with proper params', async () => {
        wrapper.vm.$registrationStore.householdCreate.editAdditionalMember = jest.fn();
        await wrapper.setProps({ index: 0 });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.memberClone, 0, wrapper.vm.sameAddress);
      });
    });

    describe('setCurrentAddress', () => {
      it('should be called when address is changing', () => {
        jest.spyOn(wrapper.vm, 'setCurrentAddress');
        const component = wrapper.findComponent(AdditionalMemberForm);
        component.vm.$emit('temporary-address-change', mockAddress());
        expect(wrapper.vm.setCurrentAddress).toHaveBeenCalledWith(mockAddress());
      });

      it('calls setCurrentAddress of the class IdentitySet ', async () => {
        jest.spyOn(wrapper.vm.memberClone, 'setCurrentAddress');
        await wrapper.vm.setCurrentAddress(mockAddress());
        expect(wrapper.vm.memberClone.setCurrentAddress).toHaveBeenCalledWith(mockAddress());
      });
    });

    describe('checkDuplicates', () => {
      it('calls store method checkDuplicates with the right params and sets the form in identityset of the memberclone', async () => {
        wrapper.vm.$registrationStore.checkDuplicates = jest.fn();
        wrapper.setData({ memberClone: { ...mockAdditionalMember(), identitySet: { ...mockIdentitySet(), setIdentity: jest.fn() } } });
        await wrapper.vm.checkDuplicates(mockIdentitySet());
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));

        expect(wrapper.vm.$registrationStore.checkDuplicates).toHaveBeenCalledWith({ form: mockIdentitySet(), isPrimaryMember: false, index: wrapper.vm.index });
        expect(wrapper.vm.memberClone.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });
    });

    describe('Template', () => {
      it('Submit calls validate method', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm, 'validate');
        const dialog = wrapper.findComponent(RcDialog);
        await dialog.vm.$emit('submit');
        expect(wrapper.vm.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('Lifecycle hook', () => {
      describe('mounted', () => {
        describe('Edit mode', () => {
          it('should set sameAddress to true if household member and household has the same temporary address', () => {
            const member = mockAdditionalMember();
            member.currentAddress = mockCampGround();
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                show: true,
                member,
                index: 0,
                i18n,
                householdId,
                disableAutocomplete: false,
              },
              data() {
                return {
                  apiKey: 'google-key',
                };
              },
              computed: {
                primaryBeneficiaryAddress() {
                  return mockCampGround();
                },
              },
            });
            wrapper.vm.$options.created.forEach((hook) => {
              hook.call(wrapper.vm);
            });
            expect(wrapper.vm.sameAddress).toBeTruthy();
          });

          it('should set sameAddress to false if household member and primary beneficiary does not have the same temporary address', () => {
            const member = mockAdditionalMember();
            member.currentAddress = mockCampGround({ placeNumber: '888' });
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                show: true,
                member,
                index: 0,
                i18n,
                householdId,
                disableAutocomplete: false,
              },
              data() {
                return {
                  apiKey: 'google-key',
                };
              },
              computed: {
                primaryBeneficiaryAddress() {
                  return mockCampGround();
                },
              },
            });
            wrapper.vm.$options.created.forEach((hook) => {
              hook.call(wrapper.vm);
            });
            expect(wrapper.vm.sameAddress).toBeFalsy();
          });

          it('should backup the member and sameAddress', () => {
            const member = mockAdditionalMember();
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                show: true,
                member,
                index: 0,
                i18n,
                householdId,
                disableAutocomplete: false,
              },
              data() {
                return {
                  apiKey: 'google-key',
                };
              },
            });
            wrapper.vm.$options.created.forEach((hook) => {
              hook.call(wrapper.vm);
            });
            expect(wrapper.vm.backupPerson).toEqual(member);
            expect(wrapper.vm.backupSameAddress).toEqual(wrapper.vm.sameAddress);
          });
        });
      });
    });
  });
});
