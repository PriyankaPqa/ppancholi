import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import { mockBeneficiary, mockHouseholdMember, Person } from '@/entities/beneficiary';
import { RcConfirmationDialog } from '@crctech/component-library';
import Component from './HouseholdMembers.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('HouseholdMembers.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        householdMembers() {
          return [mockHouseholdMember()];
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('householdMembers', () => {
      it('should be linked to household members from the store', () => {
        expect(wrapper.vm.householdMembers).toEqual(mockBeneficiary().householdMembers);
      });
    });
  });

  describe('Methods', () => {
    describe('showDialog', () => {
      it('set currentHouseholdMember to new Person in order to add', async () => {
        await wrapper.vm.showDialog(-1);
        expect(wrapper.vm.currentHouseholdMember).toEqual(new Person());
      });

      it('set currentHouseholdMember to corresponding household member to edit', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.currentHouseholdMember).toEqual(mockHouseholdMember());
      });

      it('set index to params', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.index).toEqual(0);
      });

      it('set showAddHouseholdMember to true', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.showAddHouseholdMember).toEqual(true);
      });
    });

    describe('deleteHouseholdMember', () => {
      it('should call removeHouseholdMember mutations with current index', () => {
        wrapper.vm.deleteHouseholdMember();
        expect(wrapper.vm.$storage.beneficiary.mutations.removeHouseholdMember).toHaveBeenLastCalledWith(wrapper.vm.index);
      });

      it('should set showDeleteDialog to false', () => {
        wrapper.vm.deleteHouseholdMember();
        expect(wrapper.vm.showDeleteDialog).toEqual(false);
      });

      it('should enable the add button only if number of members is below the limit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              disabledAdd: true,
            };
          },
          computed: {
            householdMembers() {
              return new Array(14).fill(mockHouseholdMember());
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.deleteHouseholdMember();
        expect(wrapper.vm.disabledAdd).toBeFalsy();
      });
    });

    describe('showConfirmationDelete', () => {
      it('should set showDeleteDialog to true', () => {
        wrapper.vm.showConfirmationDelete(0);
        expect(wrapper.vm.showDeleteDialog).toEqual(true);
      });

      it('should set index to param', () => {
        wrapper.vm.showConfirmationDelete(0);
        expect(wrapper.vm.index).toEqual(0);
      });
    });

    describe('addHouseholdMember', () => {
      it('should calls showDialog with -1 if limit is not reached', () => {
        jest.spyOn(wrapper.vm, 'showDialog');
        wrapper.vm.addHouseholdMember();
        expect(wrapper.vm.showDialog).toHaveBeenCalledWith(-1);
      });

      it('should display a warning message if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            householdMembers() {
              return new Array(20).fill(mockHouseholdMember());
            },
          },
        });
        wrapper.vm.addHouseholdMember();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith('warning.max_householdmembers_reached');
      });

      it('should disabled the button add  if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            householdMembers() {
              return new Array(20).fill(mockHouseholdMember());
            },
          },
        });
        wrapper.vm.addHouseholdMember();
        expect(wrapper.vm.disabledAdd).toBe(true);
      });
    });
  });

  describe('Template', () => {
    test('Clicking edit triggers showDialog with correct index', async () => {
      jest.spyOn(wrapper.vm, 'showDialog');
      const element = wrapper.findDataTest('edit-householdMember_0');
      await element.trigger('click');
      expect(wrapper.vm.showDialog).toHaveBeenCalledWith(0);
    });

    test('Clicking delete triggers showConfirmationDelete with correct index', async () => {
      jest.spyOn(wrapper.vm, 'showConfirmationDelete');
      const element = wrapper.findDataTest('delete-householdMember_0');
      await element.trigger('click');
      expect(wrapper.vm.showConfirmationDelete).toHaveBeenCalledWith(0);
    });

    test('Clicking add button triggers addHouseholdMember method', async () => {
      jest.spyOn(wrapper.vm, 'addHouseholdMember');
      const element = wrapper.findDataTest('add-householdMember');
      await element.trigger('click');
      expect(wrapper.vm.addHouseholdMember).toHaveBeenCalledTimes(1);
    });

    test('Validating deletion triggers deleteHouseholdMember', async () => {
      wrapper.setData({
        showDeleteDialog: true,
      });
      await wrapper.vm.$nextTick();
      jest.spyOn(wrapper.vm, 'deleteHouseholdMember');

      const dialog = wrapper.findComponent(RcConfirmationDialog);
      await dialog.vm.$emit('submit');

      expect(wrapper.vm.deleteHouseholdMember).toHaveBeenCalledTimes(1);
    });
  });
});
