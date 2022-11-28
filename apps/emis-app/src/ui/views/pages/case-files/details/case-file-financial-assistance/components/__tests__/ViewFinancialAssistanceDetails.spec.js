import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedFinancialAssistance } from '@libs/entities-lib/financial-assistance';
import { ApprovalStatus, mockCaseFinancialAssistanceEntity, ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { mockStorage } from '@/storage';
import { mockCombinedEvent, EEventStatus } from '@libs/entities-lib/event';
import routes from '@/constants/routes';
import Component from '../ViewFinancialAssistanceDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let financialAssistance = mockCaseFinancialAssistanceEntity();
const financialAssistanceTable = mockCombinedFinancialAssistance().entity;
const program = mockProgramEntity();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('ViewFinancialAssistanceDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    financialAssistance = mockCaseFinancialAssistanceEntity();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        financialAssistance,
        financialAssistanceTable,
        program,
        id: 'cfid',
      },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('fa-name', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('fa-name').text()).toEqual(financialAssistance.name);
      });
    });

    describe('fa-description', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('fa-description').text()).toEqual(financialAssistance.description);
      });
    });

    describe('program-name', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('program-name').text()).toEqual(program.name.translation.en);
      });
    });

    describe('fatable-name', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('fatable-name').text()).toEqual(financialAssistanceTable.name.translation.en);
      });
    });
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        expect(wrapper.vm.canEdit).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('showDeleteButton', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canDelete).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        expect(wrapper.vm.canDelete).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });

    describe('canViewHistory', () => {
      it('checks for approval status', async () => {
        await mountWrapper();
        financialAssistance.approvalStatusHistory = [{ ApprovalStatus: 1 }];
        financialAssistance.approvalStatus = ApprovalStatus.New;
        expect(wrapper.vm.canViewHistory).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.Pending;
        expect(wrapper.vm.canViewHistory).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.RequestAdditionalInfo;
        expect(wrapper.vm.canViewHistory).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        expect(wrapper.vm.canViewHistory).toBeTruthy();
      });

      it('returns false if  approvalStatusHistory is empty or null', async () => {
        await mountWrapper();
        financialAssistance.approvalStatus = ApprovalStatus.Pending;
        financialAssistance.approvalStatusHistory = [];
        expect(wrapper.vm.canViewHistory).toBeFalsy();
        financialAssistance.approvalStatusHistory = null;
        expect(wrapper.vm.canViewHistory).toBeFalsy();
        financialAssistance.approvalStatusHistory = [{ ApprovalStatus: 1 }];
        expect(wrapper.vm.canViewHistory).toBeTruthy();
      });

      it('return true if approval status is new and  ApprovalAction is RequestAdditionalInfo', async () => {
        await mountWrapper();
        financialAssistance.approvalStatusHistory = [{ ApprovalStatus: 1 }];
        financialAssistance.approvalStatus = ApprovalStatus.New;
        financialAssistance.approvalAction = ApprovalAction.RequestAdditionalInfo;
        expect(wrapper.vm.canViewHistory).toBeTruthy();
      });
    });

    describe('editRoute', () => {
      it('returns the edit route', async () => {
        await mountWrapper();
        expect(wrapper.vm.editRoute).toEqual({
          name: routes.caseFile.financialAssistance.edit.name,
          params: {
            financialAssistancePaymentId: financialAssistance.id,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    describe('deletePayment', () => {
      it('calls deactivate after confirmation and then goes to documents', async () => {
        await mountWrapper();
        await wrapper.vm.deletePayment();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledWith(financialAssistance.id);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.financialAssistance.home.name,
        });
      });
      it('doesnt call deactivate if no confirmation', async () => {
        await mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deletePayment();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledTimes(0);
      });
    });
  });
});
