import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseFile, CaseFileStatus } from '@libs/entities-lib/case-file';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';

import { getPiniaForUser } from '@/pinia/user/user.spec';
import Component from '../case-file-activity/components/CaseFileStatus.vue';

const localVue = createLocalVue();
const mockCaseFile = mockCombinedCaseFile();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

let wrapper;
const doMount = (level, props = {}) => {
  wrapper = shallowMount(Component, {
    localVue,
    pinia: getPiniaForUser(level),
    propsData: {
      caseFile: mockCaseFile,
      event: mockEvent,
      ...props,
    },
  });
};

describe('CaseFileStatus.vue', () => {
  describe('Computed', () => {
    describe('statuses', () => {
      it('returns the proper statuses value', async () => {
        doMount('level3');
        expect(wrapper.vm.statuses).toEqual([
          CaseFileStatus.Archived, CaseFileStatus.Closed, CaseFileStatus.Inactive, CaseFileStatus.Open,
        ]);
        doMount('level2');
        expect(wrapper.vm.statuses).toEqual([CaseFileStatus.Archived, CaseFileStatus.Closed, CaseFileStatus.Inactive]);
      });
    });

    describe('disableStatus', () => {
      it('returns the proper disable status value for L1', async () => {
        doMount('level1');
        expect(wrapper.vm.disableStatus).toBe(true);
      });
      it('returns the proper disable status value for L2+', async () => {
        const altMockCaseFile = _cloneDeep(mockCaseFile);
        altMockCaseFile.entity.caseFileStatus = CaseFileStatus.Open;
        doMount('level1', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });

        doMount('level2', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });
        expect(wrapper.vm.disableStatus).toBe(false);

        doMount('level3', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });
        expect(wrapper.vm.disableStatus).toBe(false);

        doMount('level4', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });
        expect(wrapper.vm.disableStatus).toBe(false);

        doMount('level5', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });
        expect(wrapper.vm.disableStatus).toBe(false);
      });

      it('returns the proper disable status value for L4 and lower when archived', async () => {
        const altMockCaseFile = _cloneDeep(mockCaseFile);
        altMockCaseFile.entity.caseFileStatus = CaseFileStatus.Archived;
        doMount('level4', {
          caseFile: altMockCaseFile,
          event: mockEvent,
        });

        expect(wrapper.vm.disableStatus).toBe(true);
      });

      it('returns the proper disable status value for L5 and lower when event status is not open', async () => {
        let altMockEvent = _cloneDeep(mockEvent);
        altMockEvent.schedule.status = EEventStatus.Open;
        doMount('level5', {
          caseFile: mockCaseFile,
          event: altMockEvent,
        });

        expect(wrapper.vm.disableStatus).toBe(false);

        altMockEvent = _cloneDeep(mockEvent);
        altMockEvent.schedule.status = EEventStatus.OnHold;
        await wrapper.setProps({ event: altMockEvent });
        expect(wrapper.vm.disableStatus).toBe(true);

        doMount('level6', {
          caseFile: mockCaseFile,
          event: altMockEvent,
        });
        expect(wrapper.vm.disableStatus).toBe(false);
      });
    });

    describe('confirmationDialogText', () => {
      it('return inactive confirmation dialog text ', () => {
        wrapper.vm.newStatus = CaseFileStatus.Inactive;
        expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Inactive');
        expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Inactive');
      });

      it('return open confirmation dialog text ', () => {
        wrapper.vm.newStatus = CaseFileStatus.Open;
        expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Open');
        expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Open');
      });

      it('return closed confirmation dialog text ', () => {
        wrapper.vm.newStatus = CaseFileStatus.Closed;
        expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Close');
        expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Close');
      });

      it('return archive confirmation dialog text ', () => {
        wrapper.vm.newStatus = CaseFileStatus.Archived;
        expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Archived');
        expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Archived');
      });
    });
  });

  describe('Methods', () => {
    const actions = {
      setCaseFileStatus: jest.fn(),
    };

    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
          event: mockEvent,
        },
        store: {
          modules: {
            caseFileEntities: {
              actions,
            },
          },
        },
      });
    });

    describe('onStatusChangeInit', () => {
      it('sets the newStatus property as the argument and sets showCaseFileStatusDialog to true when the status is Open', () => {
        wrapper.vm.showCaseFileStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(CaseFileStatus.Open);
        expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(CaseFileStatus.Open);
      });
      it('sets the newStatus property as the argument and sets showCaseFileStatusDialog to true when the status is Closed', () => {
        wrapper.vm.showCaseFileStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(CaseFileStatus.Closed);
        expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(CaseFileStatus.Closed);
      });

      it('sets the newStatus property as the argument and sets showCaseFileStatusDialog to true when the status is Inactive', () => {
        wrapper.vm.showCaseFileStatusDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(CaseFileStatus.Inactive);
        expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(CaseFileStatus.Inactive);
      });

      it('sets the newStatus property as the argument and sets showConfirmationDialog to true when the status is Archived', () => {
        wrapper.vm.showConfirmationDialog = false;
        wrapper.vm.newStatus = null;
        wrapper.vm.onStatusChangeInit(CaseFileStatus.Archived);
        expect(wrapper.vm.showConfirmationDialog).toBeTruthy();
        expect(wrapper.vm.newStatus).toEqual(CaseFileStatus.Archived);
      });
    });

    describe('onSubmitDialog', () => {
      it(
        'sets the rationale and reason property as the argument and sets showCaseFileStatusDialog to false and  showConfirmationDialog to be true',
        () => {
          wrapper.vm.showCaseFileStatusDialog = true;
          wrapper.vm.showConfirmationDialog = false;
          wrapper.vm.rationale = null;
          wrapper.vm.reason = null;
          const payload = { rationale: 'Some rationale', reason: { optionItemId: '', specifiedOther: null } };
          wrapper.vm.onSubmitDialog(payload);
          expect(wrapper.vm.showConfirmationDialog).toBeTruthy();
          expect(wrapper.vm.showCaseFileStatusDialog).toBeFalsy();
          expect(wrapper.vm.rationale).toEqual(payload.rationale);
          expect(wrapper.vm.reason).toEqual(payload.reason);
        },
      );
    });

    describe('submitStatusChange', () => {
      it('call setCaseFileStatus and sets showConfirmationDialog to false', async () => {
        wrapper.vm.showConfirmationDialog = true;

        await wrapper.vm.submitStatusChange();
        expect(wrapper.vm.showConfirmationDialog).toBeFalsy();
        expect(actions.setCaseFileStatus).toHaveBeenCalledTimes(1);
      });
    });
  });
});
