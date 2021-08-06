import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockMember } from '@crctech/registration-lib/src/entities/value-objects/member';
import { mockHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';

import { mockStorage } from '@/store/storage';

import Component from '../PrimaryMemberDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const householdCreate = { ...mockHouseholdCreate(), additionalMembers: [mockMember()] };

describe('PrimaryMemberDialog', () => {
  let wrapper;
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);
  storage.registration.getters.householdCreate = jest.fn(() => householdCreate);
  storage.registration.getters.personalInformation = jest.fn(() => householdCreate);

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call personalInformation getter and save the result into backupPersonalInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
          },
          mocks: { $storage: storage },
        });
        expect(wrapper.vm.$storage.registration.getters.personalInformation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.backupPersonalInfo).toEqual(householdCreate);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: { $storage: storage },
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
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        computed: {
          member() { return householdCreate.primaryBeneficiary; },
        },
        mocks: { $storage: storage },
      });
    });
    describe('onCancel', () => {
      it('calls the updatePersonIdentity service', async () => {
        await wrapper.setData({ backupPersonalInfo: householdCreate });
        await wrapper.vm.onCancel();
        expect(storage.registration.mutations.setPersonalInformation).toHaveBeenCalledWith(householdCreate);
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

      it('calls the registration mutations setPersonalInformatio service', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$services.households.updatePersonIdentity).toHaveBeenCalledWith(
          wrapper.vm.member.id, wrapper.vm.member.identitySet,
        );
      });

      it('calls the updatePersonContactInformation service', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$services.households.updatePersonContactInformation).toHaveBeenCalledWith(
          wrapper.vm.member.id, wrapper.vm.member.contactInformation,
        );
      });

      it('emits close', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });
  });
});
