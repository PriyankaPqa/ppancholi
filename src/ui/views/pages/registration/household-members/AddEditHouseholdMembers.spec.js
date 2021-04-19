import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockHouseholdMember, mockPerson } from '@/entities/value-objects/person';
import { RcDialog } from '@crctech/component-library';
import { mockCampGround } from '@/entities/value-objects/temporary-address';
import { ECanadaProvinces } from '@/types';
import HouseholdMemberForm from '@/ui/views/pages/registration/household-members/HouseholdMemberForm.vue';
import Component from './AddEditHouseholdMembers.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AddEditHouseholdMembers.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        person: mockHouseholdMember(),
        index: -1,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
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
      it('should calls editHouseholdMember with proper params', async () => {
        await wrapper.setProps({ index: 0 });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.beneficiary.mutations.editHouseholdMember)
          .toHaveBeenCalledWith(wrapper.vm.person, 0, wrapper.vm.sameAddress);
      });

      it('should calls addHouseholdMember with proper params', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.beneficiary.mutations.addHouseholdMember)
          .toHaveBeenCalledWith(wrapper.vm.person, wrapper.vm.sameAddress);
      });
    });

    describe('onIndigenousProvinceChange', () => {
      it('should be called when province is changing', () => {
        jest.spyOn(wrapper.vm, 'onIndigenousProvinceChange');
        const component = wrapper.findComponent(HouseholdMemberForm);
        component.vm.$emit('province-change', ECanadaProvinces.ON);
        expect(wrapper.vm.onIndigenousProvinceChange).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });

      it('dispatches the action to fetch indigenous identities by province', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
    });

    describe('setIdentity', () => {
      it('should be called when identity is changing', () => {
        jest.spyOn(wrapper.vm, 'setIdentity');
        const component = wrapper.findComponent(HouseholdMemberForm);
        component.vm.$emit('identity-change', mockPerson());
        expect(wrapper.vm.setIdentity).toHaveBeenCalledWith(mockPerson());
      });

      it('calls setIdentity of the class Person ', async () => {
        jest.spyOn(wrapper.vm.person, 'setIdentity');
        await wrapper.vm.setIdentity(mockPerson());
        expect(wrapper.vm.person.setIdentity).toHaveBeenCalledWith(mockPerson());
      });
    });

    describe('setIndigenousIdentity', () => {
      it('should be called when identity is changing', () => {
        jest.spyOn(wrapper.vm, 'setIndigenousIdentity');
        const component = wrapper.findComponent(HouseholdMemberForm);
        component.vm.$emit('indigenous-identity-change', mockPerson());
        expect(wrapper.vm.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
      });

      it('calls setIndigenousIdentity of the class Person ', async () => {
        jest.spyOn(wrapper.vm.person, 'setIndigenousIdentity');
        await wrapper.vm.setIndigenousIdentity(mockPerson());
        expect(wrapper.vm.person.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
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
      it('should set sameAddress to true if household member and beneficiary has the same temporary address in edit mode', () => {
        const person = mockHouseholdMember();
        person.temporaryAddress = mockCampGround();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            person,
            index: 0,
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

      it('should set sameAddress to false if household member and beneficiary does not have the same temporary address in edit mode', () => {
        const person = mockHouseholdMember();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            person,
            index: 0,
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
    });
  });
});
