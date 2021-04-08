import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockHouseholdMember } from '@/entities/value-objects/person';
import { RcDialog } from '@crctech/component-library';
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
        householdMember: mockHouseholdMember(),
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
          .toHaveBeenCalledWith(wrapper.vm.householdMember, 0, wrapper.vm.sameAddress);
      });

      it('should calls addHouseholdMember with proper params', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.validate();
        expect(wrapper.vm.$storage.beneficiary.mutations.addHouseholdMember)
          .toHaveBeenCalledWith(wrapper.vm.householdMember, wrapper.vm.sameAddress);
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
});
