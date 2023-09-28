import { mockEvent } from '@libs/entities-lib/registration-event/registrationEvent.mock';
import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { mockListOption } from '@libs/entities-lib/user-account';
import Component from './CaseFileStatusMassActionCreateDetails.vue';

const formCopy = {
  event: mockEvent(),
  status: 1,
  reason: mockListOption({ optionItemId: '9b275d2f-00a1-4345-94fe-c37b84beb400' }),
  rationale: 'rationale',
};

const localVue = createLocalVue();

const { pinia, caseFileStore } = useMockCaseFileStore();

describe('CaseFileStatusMassActionCreateDetails.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          form: formCopy,
        },
      });
    });

    afterEach(() => {
      wrapper = null;
    });

    describe('rules', () => {
      it('should return proper rules', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            form: formCopy,
          },
          computed: {
            rationaleRequired() {
              return true;
            },
          },
        });

        expect(wrapper.vm.rules).toEqual({
          event: {
            required: true,
          },
          status: {
            required: true,
          },
          reason: {
            required: true,
          },
          rationale: {
            required: wrapper.vm.rationaleRequired,
          },
          specifiedOther: {
            required: true,
          },
        });
      });
    });

    describe('showReason', () => {
      it('return true if Closed', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Closed },
        });
        expect(wrapper.vm.showReason).toBeTruthy();
      });
      it('return true if Inactive', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Inactive },
        });
        expect(wrapper.vm.showReason).toBeTruthy();
      });
      it('return false if Open', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Open },
        });
        expect(wrapper.vm.showReason).toBeFalsy();
      });
      it('return false if archived', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Archived },
        });
        expect(wrapper.vm.showReason).toBeFalsy();
      });
    });

    describe('reasons', () => {
      it('return inactive reasons ', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Inactive },
        });
        const reasons = caseFileStore.getInactiveReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });

      it('return closed reasons ', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Closed },
        });
        const reasons = caseFileStore.getCloseReasons();
        expect(wrapper.vm.reasons).toEqual(reasons);
      });
    });

    describe('rationaleRequired', () => {
      it('return true if Closed', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Closed },
        });
        expect(wrapper.vm.rationaleRequired).toBeTruthy();
      });
      it('return true if Open', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Open },
        });
        expect(wrapper.vm.rationaleRequired).toBeTruthy();
      });
      it('return false if archived', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Archived },
        });
        expect(wrapper.vm.rationaleRequired).toBeFalsy();
      });
      it('return false if inactive', async () => {
        await wrapper.setData({
          formCopy: { formCopy, status: CaseFileStatus.Inactive },
        });
        expect(wrapper.vm.rationaleRequired).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          form: formCopy,
        },
      });
    });

    afterEach(() => {
      wrapper = null;
    });

    describe('resetReason', () => {
      it('resets the selected reason and calls resetSpecifiedOther', () => {
        wrapper.vm.resetSpecifiedOther = jest.fn();
        wrapper.vm.selectedReason = mockOptionItem({ id: 1 });
        wrapper.vm.resetReason();
        expect(wrapper.vm.resetSpecifiedOther).toBeCalledTimes(1);
        expect(wrapper.vm.selectedReason).toBeNull();
      });
    });
    describe('resetSpecifiedOther', () => {
      it('resets the resetSpecifiedOther', () => {
        wrapper.vm.formCopy.reason.specifiedOther = 'mock other';
        wrapper.vm.resetSpecifiedOther();
        expect(wrapper.vm.formCopy.reason.specifiedOther).toBeNull();
      });
    });
  });

  describe('Life cycle', () => {
    describe('Create', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            form: formCopy,
          },
        });
        wrapper.vm.fetchEvents = jest.fn();
        jest.clearAllMocks();
      });

      it('should fetch close reasons', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(caseFileStore.fetchCloseReasons).toHaveBeenCalledTimes(1);
      });

      it('should fetch inactive reasons', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(caseFileStore.fetchInactiveReasons).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          form: formCopy,
        },

      });
    });

    afterEach(() => {
      wrapper = null;
    });

    describe('formCopy', () => {
      it('should emit update event with proper params', async () => {
        await wrapper.setData({ formCopy: { ...formCopy, status: 2 } });
        expect(wrapper.emitted('update:form')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('selectedReason', () => {
      it('updates the formCopy reason optionItemId', async () => {
        await wrapper.setData({ selectedReason: mockOptionItem({ id: '111' }) });
        expect(wrapper.vm.formCopy.reason.optionItemId).toEqual('111');
      });
    });
  });
});
