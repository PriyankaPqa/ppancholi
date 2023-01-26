import { RcConfirmationDialog } from '@libs/component-lib/components';
import { i18n } from '@/ui/plugins/i18n';
import {
  mockHouseholdCreate, mockAdditionalMembers, mockAdditionalMember, Member,
} from '@libs/entities-lib/src/household-create';
import { mockStorage } from '../../store/storage/storage.mock';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './AdditionalMembersLib.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AdditionalMembersLib.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        i18n,
        disableAutocomplete: false,
        showBeneficiaryName: false,
      },
      computed: {
        additionalMembers() {
          return mockAdditionalMembers();
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('additionalMembers', () => {
      it('should be linked to household members from the store', () => {
        expect(wrapper.vm.additionalMembers).toEqual(mockHouseholdCreate().additionalMembers);
      });
    });

    describe('primaryBeneficiary', () => {
      it('should be linked to household member from the store', () => {
        wrapper.vm.$registrationStore.getHouseholdCreate = jest.fn(() => mockHouseholdCreate());
        expect(wrapper.vm.primaryBeneficiary).toEqual(mockHouseholdCreate().primaryBeneficiary);
      });
    });
  });

  describe('Methods', () => {
    describe('showDialog', () => {
      it('set currentAdditionalMember to new Member in order to add', async () => {
        await wrapper.vm.showDialog(-1);
        expect(wrapper.vm.currentAdditionalMember).toEqual(new Member());
      });

      it('set currentAdditionalMember to corresponding household member to edit', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.currentAdditionalMember).toEqual(mockAdditionalMembers()[0]);
      });

      it('set index to params', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.index).toEqual(0);
      });

      it('set showAddAdditionalMember to true', async () => {
        await wrapper.vm.showDialog(0);
        expect(wrapper.vm.showAddAdditionalMember).toEqual(true);
      });
    });

    describe('deleteAdditionalMember', () => {
      it('should call removeAdditionalMember mutations with current index', () => {
        wrapper.vm.$registrationStore.householdCreate.removeAdditionalMember = jest.fn();
        wrapper.vm.deleteAdditionalMember();
        expect(wrapper.vm.$registrationStore.householdCreate.removeAdditionalMember).toHaveBeenLastCalledWith(wrapper.vm.index);
      });

      it('should set showDeleteDialog to false', () => {
        wrapper.vm.deleteAdditionalMember();
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
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            additionalMembers() {
              return new Array(14).fill(mockAdditionalMember());
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.deleteAdditionalMember();
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

    describe('addAdditionalMember', () => {
      it('should calls showDialog with -1 if limit is not reached', () => {
        jest.spyOn(wrapper.vm, 'showDialog');
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.showDialog).toHaveBeenCalledWith(-1);
      });

      it('should display a warning message if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            additionalMembers() {
              return new Array(20).fill(mockAdditionalMember());
            },
          },
        });
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.$toasted.global.warning).toHaveBeenCalledWith('warning.MAX_ADDITIONAL_MEMBERS_reached');
      });

      it('should disabled the button add  if limit is reached', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
            disableAutocomplete: false,
          },
          computed: {
            additionalMembers() {
              return new Array(20).fill(mockAdditionalMember());
            },
          },
        });
        wrapper.vm.addAdditionalMember();
        expect(wrapper.vm.disabledAdd).toBe(true);
      });
    });
  });

  describe('Template', () => {
    test('Clicking edit triggers showDialog with correct index', async () => {
      jest.spyOn(wrapper.vm, 'showDialog');
      const element = wrapper.findDataTest('edit-additionalMember_0');
      await element.trigger('click');
      expect(wrapper.vm.showDialog).toHaveBeenCalledWith(0);
    });

    test('Clicking delete triggers showConfirmationDelete with correct index', async () => {
      jest.spyOn(wrapper.vm, 'showConfirmationDelete');
      const element = wrapper.findDataTest('delete-additionalMember_0');
      await element.trigger('click');
      expect(wrapper.vm.showConfirmationDelete).toHaveBeenCalledWith(0);
    });

    test('Clicking add button triggers addAdditionalMember method', async () => {
      jest.spyOn(wrapper.vm, 'addAdditionalMember');
      const element = wrapper.findDataTest('add-additionalMember');
      await element.trigger('click');
      expect(wrapper.vm.addAdditionalMember).toHaveBeenCalledTimes(1);
    });

    test('Validating deletion triggers deleteAdditionalMember', async () => {
      wrapper.setData({
        showDeleteDialog: true,
      });
      await wrapper.vm.$nextTick();
      jest.spyOn(wrapper.vm, 'deleteAdditionalMember');

      const dialog = wrapper.findComponent(RcConfirmationDialog);
      await dialog.vm.$emit('submit');

      expect(wrapper.vm.deleteAdditionalMember).toHaveBeenCalledTimes(1);
    });

    test('Should show primary beneficiary name in EMIS app', async () => {
      wrapper.setProps({
        showBeneficiaryName: true,
      });
      await wrapper.vm.$nextTick();
      const element = wrapper.find('[data-test="primary_beneficiary_name"]');
      expect(element.exists()).toBe(true);
    });
  });
});
