import { RcDialog } from '@crctech/component-library';
import { i18n } from '@/ui/plugins/i18n';
import { mockStorage } from '../../store/storage/storage.mock';
import helpers from '../../ui/helpers';
import { mockEvent } from '../../entities/event';
import AdditionalMemberForm from './AdditionalMemberForm.vue';
import { EOptionItemStatus } from '../../types';
import {
  ECurrentAddressTypes,
  mockCampGround,
} from '../../entities/value-objects/current-address';
import { mockAdditionalMember } from '../../entities/value-objects/member';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AddEditAdditionalMembers.vue';
import { mockIdentitySet } from '../../entities/value-objects/identity-set';
import { mockAddress } from '../../entities/household-create';

const localVue = createLocalVue();
const storage = mockStorage();

storage.registration.getters.householdCreate = jest.fn(() => (
  { primaryBeneficiary: { withoutMovedDate: jest.fn(() => mockCampGround()), currentAddress: mockCampGround() } }));

describe('AddEditAdditionalMembers.vue', () => {
  let wrapper;
  storage.registration.editAdditionalMember = beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        member: mockAdditionalMember(),
        index: -1,
        i18n,
      },
      data() {
        return {
          apiKey: 'google-key',
        };
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
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
        await wrapper.setProps({ inHouseholdProfile: true, index: 0 });
        expect(wrapper.vm.getTitle).toEqual('household.details.edit.title');
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the full list of temporary addresses types without remaining home', async () => {
        const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', i18n);
        const filtered = list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
        expect(wrapper.vm.currentAddressTypeItems).toEqual(filtered);
      });
    });

    describe('shelterLocations', () => {
      it('should return the active shelterLocations for the current Event', () => {
        const event = mockEvent();
        const filtered = event.shelterLocations.filter((s) => s.status === EOptionItemStatus.Active);
        expect(wrapper.vm.shelterLocations).toEqual(filtered);
        expect(wrapper.vm.shelterLocations.filter((s) => s.status === EOptionItemStatus.Inactive)).toHaveLength(0);
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
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.member, 0, wrapper.vm.sameAddress);
      });

      it('should calls addAdditionalMember with proper params', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.registration.mutations.addAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.member, wrapper.vm.sameAddress);
      });

      it('should call addAdditionalMember with proper params', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.registration.mutations.addAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.member, wrapper.vm.sameAddress);
      });

      it('should call submitChanges  if inHouseholdProfile is true', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm, 'submitChanges').mockImplementation(() => {});
        wrapper.setProps({ inHouseholdProfile: true, index: 0 });
        await wrapper.vm.validate();
        expect(wrapper.vm.submitChanges).toHaveBeenCalledTimes(1);
      });

      it('should close the dialog', async () => {
        jest.spyOn(wrapper.vm, 'close');
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });

      describe('submitChanges', () => {
        it('should call the updatePersonIdentity service', async () => {
          await wrapper.vm.submitChanges();
          expect(wrapper.vm.$services.households.updatePersonIdentity).toHaveBeenCalledWith(
            wrapper.vm.member.id, wrapper.vm.member.identitySet,
          );
        });

        it('should call the updatePersonAddress service', async () => {
          await wrapper.vm.submitChanges();
          expect(wrapper.vm.$services.households.updatePersonAddress).toHaveBeenCalledWith(
            wrapper.vm.member.id, wrapper.vm.member.currentAddress,
          );
        });

        it('should call the store mutation editAdditionalMember', async () => {
          await wrapper.vm.submitChanges();
          expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember).toHaveBeenCalledWith(
            wrapper.vm.member, wrapper.vm.index, wrapper.vm.sameAddress,
          );
        });

        it('should call cancel if the calls fail', async () => {
          jest.spyOn(wrapper.vm, 'cancel').mockImplementation(() => {});
          wrapper.vm.$services.households.updatePersonAddress = jest.fn(() => null);
          await wrapper.vm.submitChanges();
          expect(wrapper.vm.cancel).toHaveBeenCalledTimes(1);
        });
      });

      describe('cancel', () => {
        it('should reset household member with the backup', async () => {
          await wrapper.setProps({ index: 0 });
          await wrapper.vm.cancel();
          expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
            .toHaveBeenCalledWith(wrapper.vm.backupPerson, 0, wrapper.vm.backupSameAddress);
        });
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
        jest.spyOn(wrapper.vm.member.identitySet, 'setIdentity');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.member.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
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
        jest.spyOn(wrapper.vm.member.identitySet, 'setIndigenousIdentity');
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.member.identitySet.setIndigenousIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('should call editAdditionalMember with proper params', async () => {
        await wrapper.setProps({ index: 0 });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.setIndigenousIdentity(mockIdentitySet());
        expect(wrapper.vm.$storage.registration.mutations.editAdditionalMember)
          .toHaveBeenCalledWith(wrapper.vm.member, 0, wrapper.vm.sameAddress);
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
        jest.spyOn(wrapper.vm.member, 'setCurrentAddress');
        await wrapper.vm.setCurrentAddress(mockAddress());
        expect(wrapper.vm.member.setCurrentAddress).toHaveBeenCalledWith(mockAddress());
      });
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
          member.currentAddress = {};
          member.currentAddress.withoutMovedDate = jest.fn(() => mockCampGround());
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              show: true,
              member,
              index: 0,
              i18n,
            },
            data() {
              return {
                apiKey: 'google-key',
              };
            },
            computed: {
              primaryBeneficiaryAddress() { return { withoutMovedDate: jest.fn(() => mockCampGround()) }; },
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$options.mounted.forEach((hook) => {
            hook.call(wrapper.vm);
          });
          expect(wrapper.vm.sameAddress).toBeTruthy();
        });

        it('should set sameAddress to false if household member and primary beneficiary does not have the same temporary address', () => {
          const member = mockAdditionalMember();
          member.currentAddress = {};
          member.currentAddress.withoutMovedDate = jest.fn(() => mockCampGround({ placeNumber: '888' }));
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              show: true,
              member,
              index: 0,
              i18n,
            },
            data() {
              return {
                apiKey: 'google-key',
              };
            },
            computed: {
              primaryBeneficiaryAddress() { return { withoutMovedDate: jest.fn(() => mockCampGround()) }; },
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$options.mounted.forEach((hook) => {
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
            },
            data() {
              return {
                apiKey: 'google-key',
              };
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$options.mounted.forEach((hook) => {
            hook.call(wrapper.vm);
          });
          expect(wrapper.vm.backupPerson).toEqual(member);
          expect(wrapper.vm.backupSameAddress).toEqual(wrapper.vm.sameAddress);
        });
      });
    });
  });
});
