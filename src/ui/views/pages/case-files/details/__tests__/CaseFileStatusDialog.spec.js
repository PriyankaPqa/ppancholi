/**
 * @group ui/components/case-file
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileStatus } from '@/entities/case-file';
import colors from '@/ui/plugins/vuetify/colors';
import { mockCombinedUserAccount } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import Component from '../case-file-activity/components/CaseFileStatusDialog.vue';

const localVue = createLocalVue();
const mockUser = mockCombinedUserAccount();
const storage = mockStorage();

describe('CaseFileStatusDialog.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetchInactiveReasons = jest.fn(() => mockOptionItemData());
      storage.caseFile.actions.fetchCloseReasons = jest.fn(() => mockOptionItemData());
      storage.user.getters.userId = jest.fn(() => 'mock-id');
      storage.userAccount.actions.fetch = jest.fn(() => mockUser);

      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          user() {
            return mockUser;
          },
        },
        propsData: {
          toStatus: CaseFileStatus.Open,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('title', () => {
      it('return the title for inactive ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Inactive,
        });
        expect(wrapper.vm.title).toEqual(wrapper.vm.titles[CaseFileStatus.Inactive]);
      });
      it('return the title for open ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Open,
        });
        expect(wrapper.vm.title).toEqual(wrapper.vm.titles[CaseFileStatus.Open]);
      });
      it('return the title for closed ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });
        expect(wrapper.vm.title).toEqual(wrapper.vm.titles[CaseFileStatus.Closed]);
      });
    });

    describe('reasons', () => {
      it('return inactive reasons ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Inactive,
        });
        const reasons = storage.caseFile.getters.inactiveReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });

      it('return closed reasons ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });
        const reasons = storage.caseFile.getters.closeReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });
    });

    it('return the user account by id from the storage', () => {
      expect(wrapper.vm.user).toEqual(mockUser);
    });

    describe('rationaleRequired', () => {
      it('return true if Closed', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });
        expect(wrapper.vm.rationaleRequired).toBeTruthy();
      });
      it('return true if Open', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Open,
        });
        expect(wrapper.vm.rationaleRequired).toBeTruthy();
      });
    });

    describe('reasonIncluded', () => {
      it('return true if Closed', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });
        expect(wrapper.vm.reasonIncluded).toBeTruthy();
      });
      it('return true if Inactive', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Inactive,
        });
        expect(wrapper.vm.reasonIncluded).toBeTruthy();
      });
    });

    describe('backgroundColor', () => {
      it('return light green when status open', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Open,
        });
        expect(wrapper.vm.backgroundColor).toEqual({ backgroundColor: colors.chips.green_pale });
      });

      it('return light red  when status closed', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });

        expect(wrapper.vm.backgroundColor).toEqual({ backgroundColor: colors.chips.red_pale });
      });
      it('return light grey  when status inactive', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Inactive,
        });
        expect(wrapper.vm.backgroundColor).toEqual({ backgroundColor: colors.grey.lighten4 });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          toStatus: CaseFileStatus.Open,
          show: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('onSubmit', () => {
      it('emits submit, with the right data if form is valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.rationale = 'foo';
        wrapper.vm.selectedReason = { id: 'TEST_ID' };
        wrapper.vm.specifiedOther = null;
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')[0][0]).toEqual({
          rationale: 'foo',
          reason: {
            OptionItemId: 'TEST_ID',
            SpecifiedOther: null,
          },
        });
      });
    });
  });
});
