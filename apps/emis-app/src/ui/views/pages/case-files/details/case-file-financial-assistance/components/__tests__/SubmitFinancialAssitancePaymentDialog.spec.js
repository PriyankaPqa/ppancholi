import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockApprovalTableData } from '@libs/entities-lib/approvals/approvals-table';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockProvider } from '@/services/provider';
import Component from '../SubmitFinancialAssistancePaymentDialog.vue';

const localVue = createLocalVue();
const services = mockProvider();

const financialAssistance = mockFinancialAssistanceTableEntity();

let wrapper;

const { pinia, userStore } = useMockUserStore();
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);
const { userAccountStore } = useMockUserAccountStore(pinia);

const doMount = ({ approvalRequired = false, approvalTable, otherOptions = {} } = {}) => {
  const options = {
    localVue,
    pinia,
    propsData: {
      financialAssistance,
      show: true,
      totalAmountToSubmit: '10$',
      approvalRequired,
      programId: 'programId',
      eventId: 'eventId',
    },
    data: () => ({
      approvalTable,
    }),
    mocks: {
      $services: services,
    },
    ...otherOptions,
  };

  wrapper = shallowMount(Component, options);

  jest.clearAllMocks();
};

describe('SubmitFinancialAssistancePaymentDialog.vue', () => {
  describe('Computed', () => {
    describe('myUserRoleId', () => {
      it('returns the right value', () => {
        userAccountStore.getById = jest.fn(() => ({ roles: [{ optionItemId: 'my-role-id' }] }));
        doMount();
        expect(wrapper.vm.myUserRoleId).toEqual('my-role-id');
      });
    });

    describe('rules', () => {
      it('should return the correct rules', () => {
        doMount();
        expect(wrapper.vm.rules.agree).toEqual({
          required: { allowFalse: false },
        });
        expect(wrapper.vm.rules.supervisor).toEqual({
          required: true,
        });
      });
    });

    describe('useApprovalFlow', () => {
      it('returns true if approval is required and there is a table', async () => {
        doMount({ approvalRequired: true, approvalTable: {} });

        expect(wrapper.vm.useApprovalFlow).toBeTruthy();
      });

      it('returns false if there is no table', async () => {
        doMount({ approvalRequired: true });

        expect(wrapper.vm.useApprovalFlow).toBeFalsy();
      });

      it('returns false if approvalRequired is false', async () => {
        doMount({ approvalRequired: false, approvalTable: {} });

        expect(wrapper.vm.useApprovalFlow).toBeFalsy();
      });
    });

    describe('hasInvalidTable', () => {
      it('returns true if approval is required and there is no table', async () => {
        doMount({ approvalRequired: true });

        expect(wrapper.vm.hasInvalidTable).toBeTruthy();
      });

      it('returns false if approvalRequired is false', async () => {
        doMount({ approvalRequired: false, approvalTable: {} });

        expect(wrapper.vm.hasInvalidTable).toBeFalsy();
      });

      it('returns false if there is a table', async () => {
        doMount({ approvalRequired: true, approvalTable: {} });

        expect(wrapper.vm.hasInvalidTable).toBeFalsy();
      });
    });

    describe('hasNoUsers', () => {
      it('returns false if approval is not required', async () => {
        doMount({ approvalRequired: false, approvalTable: {} });
        expect(wrapper.vm.hasNoUsers).toBeFalsy();
      });

      it('returns false if it requires approval and there are users to approve', async () => {
        doMount({ approvalRequired: true, approvalTable: {} });
        await wrapper.setData({ users: ['user-id-1'] });
        expect(wrapper.vm.hasNoUsers).toBeFalsy();
      });
      it('returns false if it requires approval and the users are loading', async () => {
        doMount({ approvalRequired: true, approvalTable: {} });
        await wrapper.setData({ loadingUsers: true });
        expect(wrapper.vm.hasNoUsers).toBeFalsy();
      });

      it('returns true if it requires approval and there are no users to approve', async () => {
        doMount({ approvalRequired: true, approvalTable: {} });
        await wrapper.setData({ users: [], loadingUsers: false });
        expect(wrapper.vm.hasNoUsers).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      describe('Use approval flow', () => {
        it('should call submitApprovalRequest, emit update event and display a toast if form is valid', async () => {
          doMount({ approvalRequired: true, approvalTable: {} });
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => true);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();

          expect(financialAssistancePaymentStore.submitApprovalRequest)
            .toBeCalledWith(wrapper.vm.financialAssistance.id, wrapper.vm.selectedUserId);

          expect(wrapper.emitted('update:financial-assistance')).toBeTruthy();

          expect(wrapper.vm.$toasted.global.success).toBeCalledWith('caseFile.financialAssistance.submitApproval.success');
        });

        it('should not call submitApprovalRequest if form is not valid', async () => {
          doMount({ approvalRequired: true, approvalTable: {} });
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => false);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();

          expect(financialAssistancePaymentStore.submitApprovalRequest)
            .not.toBeCalledWith(wrapper.vm.financialAssistance.id, wrapper.vm.selectedUserId);
        });
      });

      describe('Use regular flow', () => {
        it('should call submitPayment emit update event and display a toast if form is valid', async () => {
          doMount();
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => true);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();
          expect(financialAssistancePaymentStore.submitFinancialAssistancePayment).toBeCalledWith(wrapper.vm.financialAssistance.id);
          expect(wrapper.emitted('update:financial-assistance')).toBeTruthy();
          expect(wrapper.vm.$toasted.global.success).toBeCalledWith('caseFile.financialAssistance.toast.assistanceSubmitted');
        });

        it('should not call submitPayment if form is valid', async () => {
          doMount();
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => false);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();
          expect(financialAssistancePaymentStore.submitFinancialAssistancePayment).not.toBeCalledWith(wrapper.vm.financialAssistance.id);
        });
      });
    });

    describe('closeSubmitPaymentDialog', () => {
      it('should update show props to false', async () => {
        doMount();
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.closeSubmitPaymentDialog();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });

      it('should reset total amount to submit', async () => {
        doMount();
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.closeSubmitPaymentDialog();
        expect(wrapper.emitted('update:total-amount-to-submit')[0][0]).toEqual('');
      });

      it('should set agree to false', async () => {
        doMount();
        await wrapper.setData({ agree: true });
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.closeSubmitPaymentDialog();
        expect(wrapper.vm.agree).toEqual(false);
      });

      it('should call submitPaymentForm reset', async () => {
        doMount();
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.closeSubmitPaymentDialog();
        expect(wrapper.vm.$refs.submitPaymentForm.reset).toBeCalled();
      });
    });

    describe('getUsersByRolesAndEvent', () => {
      it('should return all users having a role for an event', async () => {
        userStore.getUserId = jest.fn(() => 'my-id');
        const users = [
          {
            roles: [{ optionItemId: '1' }],
          },
          {
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

      it('should exclude the id of the current user', async () => {
        userStore.getUserId = jest.fn(() => 'my-id');
        const users = [
          {
            id: '1',
            roles: [{ optionItemId: '1' }],
          },
          {
            id: 'my-id',
            roles: [{ optionItemId: '1' }],
          }];
        const targetRoles = ['1', '2'];
        const targetEvent = 'B';
        services.userAccounts.fetchByEventAndRole = jest.fn(() => users);
        doMount();

        await wrapper.vm.getUsersByRolesAndEvent(targetRoles, targetEvent);

        expect(wrapper.vm.users).toEqual([users[0]]);
        expect(services.userAccounts.fetchByEventAndRole).toHaveBeenCalledWith(targetEvent, targetRoles);
      });
    });

    describe('fetchDataForApproval', () => {
      it('should call getApprovalTableByProgramId with program ID', async () => {
        doMount();
        await wrapper.vm.fetchDataForApproval();
        expect(wrapper.vm.$services.approvalTables.getApprovalTableByProgramId).toBeCalledWith('programId');
      });

      it('should not call getUsersByRolesAndEvent if the fetched program is inactive', async () => {
        doMount();
        wrapper.vm.$services.approvalTables.getApprovalTableByProgramId = jest.fn(() => mockApprovalTableData({ approvalBaseStatus: 2 }));
        wrapper.vm.getUsersByRolesAndEvent = jest.fn();
        await wrapper.setData({ approvalTable: null });
        await wrapper.vm.fetchDataForApproval();
        expect(wrapper.vm.getUsersByRolesAndEvent).not.toBeCalled();
        expect(wrapper.vm.approvalTable).toBeNull();
      });

      it('should call getUsersByRolesAndEvent with proper event id and roles returned by getCurrentApprovalRoles', async () => {
        doMount();
        wrapper.vm.getUsersByRolesAndEvent = jest.fn();
        wrapper.vm.getCurrentApprovalRoles = jest.fn(() => ['roleId1']);
        await wrapper.vm.fetchDataForApproval();
        expect(wrapper.vm.getUsersByRolesAndEvent).toBeCalledWith(['roleId1'], 'eventId');
      });
    });

    describe('getCurrentApprovalRoles', () => {
      it('returns the roles in the group where the current user role is, if the role of the user is in an approval group', async () => {
        doMount({ otherOptions: { computed: {
          myUserRoleId() {
            return 'my-user-role-id';
          },
        } } });
        const approvalGroups = { groups: [{ roles: ['group-1-role'] }, { roles: ['my-user-role-id', 'group-2-role'] }] };
        const roles = await wrapper.vm.getCurrentApprovalRoles(approvalGroups);
        expect(roles).toEqual(['my-user-role-id', 'group-2-role']);
      });

      it('returns the first roles group, if the role of the user is not in an approval group', () => {
        doMount({ otherOptions: { computed: {
          myUserRoleId() {
            return 'my-user-role-id';
          },
        } } });
        const approvalGroups = { groups: [{ roles: ['group-1-role'] }, { roles: ['group-2-role'] }] };

        const roles = wrapper.vm.getCurrentApprovalRoles(approvalGroups);
        expect(roles).toEqual(['group-1-role']);
      });
    });
  });
});
