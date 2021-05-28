import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { CaseFile, mockCaseFilesSearchData, ECaseFileStatus } from '@/entities/case-file';
import _cloneDeep from 'lodash/cloneDeep';

import Component from '../case-file-activity/components/CaseFileStatus.vue';

const localVue = createLocalVue();
const mockCaseFile = new CaseFile(mockCaseFilesSearchData()[0]);

describe('CaseFileStatus.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          caseFile: mockCaseFile,
        },
      });
    });

    describe('Computed', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFile: mockCaseFile,
          },
        });
      });
      describe('statuses', () => {
        it('returns the proper statuses value', async () => {
          await wrapper.setRole('level3');
          expect(wrapper.vm.statuses).toEqual([
            ECaseFileStatus.Archived, ECaseFileStatus.Closed, ECaseFileStatus.Inactive, ECaseFileStatus.Open,
          ]);
          await wrapper.setRole('level2');
          expect(wrapper.vm.statuses).toEqual([ECaseFileStatus.Archived, ECaseFileStatus.Closed, ECaseFileStatus.Inactive]);
        });
      });

      describe('disableStatus', () => {
        it('returns the proper disable status value for L1', async () => {
          await wrapper.setRole('level1');
          expect(wrapper.vm.disableStatus).toBe(true);
        });
        it('returns the proper disable status value for L2+', async () => {
          const altMockCaseFile = _cloneDeep(mockCaseFile);
          altMockCaseFile.caseFileStatus = ECaseFileStatus.Open;
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              caseFile: altMockCaseFile,
            },
          });

          await wrapper.setRole('level2');
          expect(wrapper.vm.disableStatus).toBe(false);

          await wrapper.setRole('level3');
          expect(wrapper.vm.disableStatus).toBe(false);

          await wrapper.setRole('level4');
          expect(wrapper.vm.disableStatus).toBe(false);

          await wrapper.setRole('level5');
          expect(wrapper.vm.disableStatus).toBe(false);
        });

        it('returns the proper disable status value for L5 and lower when archived', async () => {
          const altMockCaseFile = _cloneDeep(mockCaseFile);
          altMockCaseFile.caseFileStatus = ECaseFileStatus.Archived;
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              caseFile: altMockCaseFile,
            },
          });
          await wrapper.setRole('level4');

          expect(wrapper.vm.disableStatus).toBe(true);
        });
      });

      describe('confirmationDialogText', () => {
        it('return inactive confirmation dialog text ', () => {
          wrapper.vm.newStatus = ECaseFileStatus.Inactive;
          expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Inactive');
          expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Inactive');
        });

        it('return open confirmation dialog text ', () => {
          wrapper.vm.newStatus = ECaseFileStatus.Open;
          expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Open');
          expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Open');
        });

        it('return closed confirmation dialog text ', () => {
          wrapper.vm.newStatus = ECaseFileStatus.Closed;
          expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Close');
          expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Close');
        });

        it('return archive confirmation dialog text ', () => {
          wrapper.vm.newStatus = ECaseFileStatus.Archived;
          expect(wrapper.vm.confirmationDialogText.title).toEqual('caseFile.changeStatusConfirmTitle.Archived');
          expect(wrapper.vm.confirmationDialogText.message).toEqual('caseFile.changeStatusConfirmBody.Archived');
        });
      });
    });
    describe('status select', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('case-file-detail-status-select');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('lifecycle', () => {

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
          },
          store: {
            modules: {
              caseFile: {
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
          wrapper.vm.onStatusChangeInit(ECaseFileStatus.Open);
          expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
          expect(wrapper.vm.newStatus).toEqual(ECaseFileStatus.Open);
        });
        it('sets the newStatus property as the argument and sets showCaseFileStatusDialog to true when the status is Closed', () => {
          wrapper.vm.showCaseFileStatusDialog = false;
          wrapper.vm.newStatus = null;
          wrapper.vm.onStatusChangeInit(ECaseFileStatus.Closed);
          expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
          expect(wrapper.vm.newStatus).toEqual(ECaseFileStatus.Closed);
        });

        it('sets the newStatus property as the argument and sets showCaseFileStatusDialog to true when the status is Inactive', () => {
          wrapper.vm.showCaseFileStatusDialog = false;
          wrapper.vm.newStatus = null;
          wrapper.vm.onStatusChangeInit(ECaseFileStatus.Inactive);
          expect(wrapper.vm.showCaseFileStatusDialog).toBeTruthy();
          expect(wrapper.vm.newStatus).toEqual(ECaseFileStatus.Inactive);
        });

        it('sets the newStatus property as the argument and sets showConfirmationDialog to true when the status is Archived', () => {
          wrapper.vm.showConfirmationDialog = false;
          wrapper.vm.newStatus = null;
          wrapper.vm.onStatusChangeInit(ECaseFileStatus.Archived);
          expect(wrapper.vm.showConfirmationDialog).toBeTruthy();
          expect(wrapper.vm.newStatus).toEqual(ECaseFileStatus.Archived);
        });
      });

      describe('onSubmitDialog', () => {
        it('sets the rationale and reason property as the argument and sets showCaseFileStatusDialog to false and  showConfirmationDialog to be true',
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
          });
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
});
