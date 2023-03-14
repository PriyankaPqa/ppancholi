import { createLocalVue, shallowMount } from '@/test/testSetup';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import Component from '../HouseholdStatusDialog.vue';

const localVue = createLocalVue();
const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { userStore } = useMockUserStore(pinia);

describe('HouseholdStatusDialog.vue', () => {
  let wrapper;
  const doMount = () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        toStatus: HouseholdStatus.Open,
        show: true,
      },
      data() {
        return {
          rationale: 'test-rationale',
        };
      },
    });
  };
  beforeEach(() => {
    doMount();
  });

  describe('Template', () => {
    describe('household-status-dialog', () => {
      it('should emit update:show event when trigger cancel or close event', async () => {
        const element = wrapper.findDataTest('household-status-dialog');
        await element.vm.$emit('cancel');
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
        await element.vm.$emit('close');
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('return the title for open ', async () => {
        await wrapper.setProps({
          toStatus: HouseholdStatus.Open,
        });
        expect(wrapper.vm.title).toEqual('household.status.confirmation.title.Open');
      });
      it('return the title for Archived ', async () => {
        await wrapper.setProps({
          toStatus: HouseholdStatus.Archived,
        });
        expect(wrapper.vm.title).toEqual('household.status.confirmation.title.Archived');
      });
      it('return the title for closed ', async () => {
        await wrapper.setProps({
          toStatus: HouseholdStatus.Closed,
        });
        expect(wrapper.vm.title).toEqual('household.status.confirmation.title.Closed');
      });
    });

    describe('userAccountMetadata', () => {
      it('should get data with correct ID', () => {
        wrapper.vm.userAccountMetadata.getById = jest.fn();
        userStore.getUserId = jest.fn(() => 'its me');
        expect(userAccountMetadataStore.getById).toHaveBeenCalledWith('its me');
      });
    });

    describe('statusChangedBy', () => {
      it('should generate proper string', () => {
        userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata());
        expect(wrapper.vm.statusChangedBy).toEqual('household.status.confirmation.changed_by Jane Smith (System Admin)');
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      it('emits submit, with the right data if form is valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.rationale = 'foo';
        wrapper.vm.toStatus = HouseholdStatus.Open;
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')[0][0]).toEqual({
          status: HouseholdStatus.Open,
          rationale: 'foo',
        });
      });
    });
  });
});
