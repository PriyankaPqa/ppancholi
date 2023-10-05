import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockCombinedCaseFinancialAssistance, ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { mockProvider } from '@/services/provider';
import { createTestingPinia } from '@pinia/testing';
import Component from './ApprovalActionDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();
const pinia = createTestingPinia({ stubActions: false });
let wrapper;

const FAPayment = mockCombinedCaseFinancialAssistance({ eventId: 'mock-event-id' });
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);

const doMount = (otherOptions = {}, fullMount = false) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      show: true,
      financialAssistancePayment: FAPayment,
      myRoleId: 'my-role-id',
    },
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };

  wrapper = (fullMount ? mount : shallowMount)(Component, options);
};

describe('ApprovalActionDialog', () => {
  describe('Computed', () => {
    describe('excludedUsers', () => {
      it('returns the right values', () => {
        doMount();
        expect(wrapper.vm.excludedUsers)
          .toEqual([wrapper.vm.myRoleId, wrapper.vm.financialAssistancePayment.entity.initialSubmitter, wrapper.vm.financialAssistancePayment.entity.submittedBy.userId]);
      });
    });

    describe('isApproved', () => {
      it('returns true when there is an approval action and the action is Approved', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Approved } });
        expect(wrapper.vm.isApproved).toEqual(true);
      });
      it('returns false when there is an approval action and the action is not Approved', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined } });
        expect(wrapper.vm.isApproved).toEqual(false);
      });
      it('returns false when there is no approval action', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: null } });
        expect(wrapper.vm.isApproved).toEqual(false);
      });
    });

    describe('showWarning', () => {
      it('returns true if it needs a supervisor and there are no users fetched with the next role to approve', async () => {
        doMount({
          computed: {
            needsNextApprover() {
              return true;
            },
          },
        });
        await wrapper.setData({ users: [] });
        expect(wrapper.vm.showWarning).toEqual(true);
      });

      it('returns false if there are users with the next role to approve', async () => {
        doMount({
          computed: {
            needsNextApprover() {
              return true;
            },
          },
        });
        await wrapper.setData({ users: [{}] });
        expect(wrapper.vm.showWarning).toEqual(false);
      });

      it('returns false if there is no need for next approver', () => {
        doMount({
          computed: {
            needsNextApprover() {
              return false;
            },
          },
        });
        expect(wrapper.vm.showWarning).toEqual(false);
      });
    });

    describe('needsNextApprover', () => {
      it('returns true if the payment gets approved and there are roles for next approval group', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Approved }, nextApprovalGroupRoles: ['1'] });
        expect(wrapper.vm.needsNextApprover).toEqual(true);
      });

      it('returns false if the payment action is different than approved', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined } });
        expect(wrapper.vm.needsNextApprover).toEqual(false);
      });
    });
  });

  describe('Watch', () => {
    describe('approvalAction', () => {
      it('resets property values if it changes', async () => {
        doMount();
        wrapper.vm.$refs.actionApprovalForm.reset = jest.fn();
        wrapper.vm.fetchRolesAndUsers = jest.fn();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined, rationale: 'mock-rationale', submittedTo: 'id-1' }, confirm: true });
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Approved } });
        expect(wrapper.vm.action).toEqual({ approvalAction: ApprovalAction.Approved, rationale: '', submittedTo: null });
        expect(wrapper.vm.confirm).toEqual(false);
      });
      it('calls fetchRolesAndUsers if it is approved', async () => {
        doMount({
          computed: {
            isApproved() {
              return true;
            },
          },
        });
        wrapper.vm.fetchRolesAndUsers = jest.fn();
        wrapper.vm.$refs.actionApprovalForm.reset = jest.fn();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined, rationale: 'mock-rationale', submittedTo: 'id-1' }, usersFetched: false });
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Approved } });
        expect(wrapper.vm.fetchRolesAndUsers).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('fetchRolesAndUsers', () => {
      it('calls the service getNextApprovalGroupRoles with the payment id', async () => {
        doMount();
        wrapper.vm.$services.financialAssistancePaymentsService.getNextApprovalGroupRoles = jest.fn();
        await wrapper.vm.fetchRolesAndUsers();
        expect(wrapper.vm.$services.financialAssistancePaymentsService.getNextApprovalGroupRoles).toHaveBeenCalledWith(wrapper.vm.financialAssistancePayment.entity.id);
      });

      it('calls getUsersByRolesAndEvent and assigns roles to nextApprovalGroupRoles', async () => {
        doMount();
        wrapper.vm.$services.financialAssistancePaymentsService.getNextApprovalGroupRoles = jest.fn(() => ['role-1']);
        wrapper.vm.getUsersByRolesAndEvent = jest.fn();
        await wrapper.vm.fetchRolesAndUsers();
        expect(wrapper.vm.getUsersByRolesAndEvent).toHaveBeenCalledWith(['role-1'], wrapper.vm.financialAssistancePayment.metadata.eventId);
      });
    });

    describe('onSubmit', () => {
      it('calls submitApprovalAction action, toaster and closeActionApprovalDialog, and emits updateItems', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined, rationale: 'mock-rationale', submittedTo: 'id-1' }, confirm: true });
        wrapper.vm.$refs.actionApprovalForm.validate = jest.fn(() => true);
        wrapper.vm.$toasted.global.success = jest.fn();
        wrapper.vm.closeActionApprovalDialog = jest.fn();
        await wrapper.vm.onSubmit();

        expect(financialAssistancePaymentStore.submitApprovalAction).toHaveBeenCalledWith(FAPayment.entity.id, wrapper.vm.action);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('approval.requests.action.approvalStatusUpdated');
        expect(wrapper.vm.closeActionApprovalDialog).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('updateItems')[0][0]).toEqual(FAPayment.entity.id);
      });

      it('does not call the action if validation fails', async () => {
        jest.clearAllMocks();
        doMount();
        wrapper.vm.$refs.actionApprovalForm.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(financialAssistancePaymentStore.submitApprovalAction).not.toHaveBeenCalled();
      });
    });

    describe('closeActionApprovalDialog', () => {
      it('emits show false and sets confirm to false, and resets the form', async () => {
        doMount();
        wrapper.setData({ confirm: true });
        wrapper.vm.$refs.actionApprovalForm.reset = jest.fn();
        await wrapper.vm.closeActionApprovalDialog();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
        expect(wrapper.vm.confirm).toEqual(false);
        expect(wrapper.vm.$refs.actionApprovalForm.reset).toBeCalledTimes(1);
      });
    });

    describe('getUsersByRolesAndEvent', () => {
      it('should call store and return all users having a role for an event', async () => {
        const users = [
          {
            id: '1',
            roles: [{ optionItemId: '1' }],
          },
          {
            id: '2',
            roles: [{ optionItemId: '1' }],
          }];
        const targetRoles = ['1', '2'];
        const targetEvent = 'B';
        services.userAccounts.fetchByEventAndRole = jest.fn(() => users);
        doMount();

        await wrapper.vm.getUsersByRolesAndEvent(targetRoles, targetEvent);

        expect(wrapper.vm.users).toEqual(users);
        expect(services.userAccounts.fetchByEventAndRole).toHaveBeenCalledWith(targetEvent, targetRoles);
      });

      it('should exclude users from excludedUsers list', async () => {
        const users = [
          {
            id: '1',
            roles: [{ optionItemId: '1' }],
          },
          {
            id: 'excluded-id',
            roles: [{ optionItemId: '1' }],
          },
        ];
        const targetRoles = ['1', '2'];
        const targetEvent = 'B';
        services.userAccounts.fetchByEventAndRole = jest.fn(() => users);

        doMount({
          computed: {
            excludedUsers() {
              return ['excluded-id'];
            },
          },
        });

        await wrapper.vm.getUsersByRolesAndEvent(targetRoles, targetEvent);

        expect(wrapper.vm.users).toEqual([users[0]]);
        expect(services.userAccounts.fetchByEventAndRole).toHaveBeenCalledWith(targetEvent, targetRoles);
      });
    });

    describe('getUserName', () => {
      it('returns the user display name', () => {
        doMount();
        const user = { displayName: 'John Smith' };
        expect(wrapper.vm.getUserName(user)).toEqual('John Smith');
      });
    });
  });

  describe('Template', () => {
    describe('warning message', () => {
      it('displays when there are no users for the next role', () => {
        doMount({
          computed: {
            showWarning() {
              return true;
            },
          },
        });

        expect(wrapper.findDataTest('approval_action_warning').exists()).toBeTruthy();
      });
      it('does not display when there should be no warning', () => {
        doMount({
          computed: {
            showWarning() {
              return false;
            },
          },
        });

        expect(wrapper.findDataTest('approval_action_warning').exists()).toBeFalsy();
      });
    });

    describe('next supervisor dropdown', () => {
      it('displays when action is approved and needs next approver', async () => {
        doMount({
          computed: {
            needsNextApprover() {
              return true;
            },
          },
        });

        expect(wrapper.findDataTest('approval_action_supervisor').exists()).toBeTruthy();
      });
      it('does not display when action does not need next approver', async () => {
        doMount({
          computed: {
            needsNextApprover() {
              return false;
            },
          },
        });
        expect(wrapper.findDataTest('approval_action_supervisor').exists()).toBeFalsy();
      });
    });

    describe('confirmation textbox', () => {
      it('displays with the right text when action is declined', async () => {
        doMount({}, true);
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Declined, rationale: 'abc' } });
        const element = wrapper.findDataTest('checkbox_confirmed');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toBe('approval.requests.action.confirm.decline');
      });

      it('displays with the right text when action is request additional info', async () => {
        doMount({}, true);
        await wrapper.setData({ action: { approvalAction: ApprovalAction.RequestAdditionalInfo, rationale: 'abc' } });
        const element = wrapper.findDataTest('checkbox_confirmed');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toBe('approval.requests.action.confirm.requestInfo');
      });

      it('does not display when action is approved', async () => {
        doMount();
        await wrapper.setData({ action: { approvalAction: ApprovalAction.Approved, submittedTo: 'abc' } });
        const element = wrapper.findDataTest('checkbox_confirmed');
        expect(element.exists()).toBeFalsy();
      });
    });
  });
});
