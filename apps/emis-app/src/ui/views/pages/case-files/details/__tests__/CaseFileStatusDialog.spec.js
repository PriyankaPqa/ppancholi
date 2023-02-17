import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import colors from '@libs/shared-lib/plugins/vuetify/colors';
import { mockUserAccountEntity, mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockUserStore } from '@/pinia/user/user.mock';

import Component from '../case-file-activity/components/CaseFileStatusDialog.vue';

const localVue = createLocalVue();

const { pinia, userAccountStore, userAccountMetadataStore } = useMockUserAccountStore();
const { userStore } = useMockUserStore(pinia);
const { caseFileStore } = useMockCaseFileStore(pinia);

describe('CaseFileStatusDialog.vue', () => {
  let wrapper;
  userStore.getUserId = jest.fn(() => 'mock-id');

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          toStatus: CaseFileStatus.Open,
          show: true,
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
        const reasons = caseFileStore.getInactiveReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });

      it('return closed reasons ', async () => {
        await wrapper.setProps({
          toStatus: CaseFileStatus.Closed,
        });
        const reasons = caseFileStore.getCloseReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });
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

    describe('userMetadata', () => {
      it('should return correct data', () => {
        userAccountMetadataStore.getById = jest.fn(() => mockUserAccountMetadata());
        expect(wrapper.vm.userMetadata).toEqual(mockUserAccountMetadata());
      });
    });

    describe('user', () => {
      it('should return correct data', () => {
        userAccountStore.getById = jest.fn(() => mockUserAccountEntity());
        expect(wrapper.vm.user).toEqual(mockUserAccountEntity());
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          toStatus: CaseFileStatus.Open,
          show: true,
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

  describe('life cycle', () => {
    describe('created', () => {
      it('should fetch userAccount entity and metadata with userId', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(userAccountStore.fetch).toHaveBeenCalledWith('mock-id');
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-id', false);
      });
    });
  });
});
