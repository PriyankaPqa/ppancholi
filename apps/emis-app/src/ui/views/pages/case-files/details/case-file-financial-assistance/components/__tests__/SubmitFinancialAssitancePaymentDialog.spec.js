import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockApprovalTableData } from '@libs/entities-lib/approvals/approvals-table';
import Component from '../SubmitFinancialAssistancePaymentDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const financialAssistance = mockFinancialAssistanceTableEntity();

let wrapper;

const doMount = (shallow = true, approvalRequired = false, approvalTable = null, hasFeature = true) => {
  const options = {
    localVue,
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
      $storage: storage,
      $hasFeature: () => hasFeature,
    },
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
  jest.clearAllMocks();
};

describe('SubmitFinancialAssistancePaymentDialog.vue', () => {
  describe('Computed', () => {
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
      it('returns true if approval is required and there is a table and feature flag is on', async () => {
        doMount(true, true, {}, true);

        expect(wrapper.vm.useApprovalFlow).toBeTruthy();
      });

      it('returns false if there is no table', async () => {
        doMount(true, true, null, true);

        expect(wrapper.vm.useApprovalFlow).toBeFalsy();
      });

      it('returns false if approvalRequired is false', async () => {
        doMount(true, false, {}, true);

        expect(wrapper.vm.useApprovalFlow).toBeFalsy();
      });

      it('returns false if feature flag is off', async () => {
        doMount(true, true, {}, false);

        expect(wrapper.vm.useApprovalFlow).toBeFalsy();
      });
    });

    describe('hasInvalidTable', () => {
      it('returns true if approval is required and there is no table and feature flag is on', async () => {
        doMount(true, true, null, true);

        expect(wrapper.vm.hasInvalidTable).toBeTruthy();
      });

      it('returns false if approvalRequired is false', async () => {
        doMount(true, false, {}, true);

        expect(wrapper.vm.hasInvalidTable).toBeFalsy();
      });

      it('returns false if there is a table', async () => {
        doMount(true, true, {}, true);

        expect(wrapper.vm.hasInvalidTable).toBeFalsy();
      });

      it('returns false if feature flag is off', async () => {
        doMount(true, true, null, false);

        expect(wrapper.vm.hasInvalidTable).toBeFalsy();
      });
    });

    describe('approvalNotRequired', () => {
      it('returns true if approval is not required ', async () => {
        doMount(true, false, null, true);

        expect(wrapper.vm.approvalNotRequired).toBeTruthy();
      });

      it('returns true if feature flag is off', async () => {
        doMount(true, true, {}, false);

        expect(wrapper.vm.approvalNotRequired).toBeTruthy();
      });

      it('returns false if feature flag is on and approvalRequired is true', async () => {
        doMount(true, true, null, true);

        expect(wrapper.vm.approvalNotRequired).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      describe('Use approval flow', () => {
        it('should call submitApprovalRequest, emit update event and display a toast if form is valid', async () => {
          doMount(true, true, true);
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => true);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();

          expect(wrapper.vm.$storage.financialAssistancePayment.actions.submitApprovalRequest)
            .toBeCalledWith(wrapper.vm.financialAssistance.id, wrapper.vm.selectedUserId);

          expect(wrapper.emitted('update:financial-assistance')).toBeTruthy();

          expect(wrapper.vm.$toasted.global.success).toBeCalledWith('caseFile.financialAssistance.submitApproval.success');
        });

        it('should not call submitApprovalRequest if form is not valid', async () => {
          doMount(true, true, true);
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => false);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();

          expect(wrapper.vm.$storage.financialAssistancePayment.actions.submitApprovalRequest)
            .not.toBeCalledWith(wrapper.vm.financialAssistance.id, wrapper.vm.selectedUserId);
        });
      });

      describe('Use regular flow', () => {
        it('should call submitPayment emit update event and display a toast if form is valid', async () => {
          doMount(true, false, false);
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => true);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.financialAssistancePayment.actions.submitFinancialAssistancePayment).toBeCalledWith(wrapper.vm.financialAssistance.id);
          expect(wrapper.emitted('update:financial-assistance')).toBeTruthy();
          expect(wrapper.vm.$toasted.global.success).toBeCalledWith('caseFile.financialAssistance.toast.assistanceSubmitted');
        });

        it('should not call submitPayment if form is valid', async () => {
          doMount(true, false, false);
          wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => false);
          wrapper.vm.closeSubmitPaymentDialog = jest.fn();

          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$storage.financialAssistancePayment.actions.submitFinancialAssistancePayment).not.toBeCalledWith(wrapper.vm.financialAssistance.id);
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

      it('should set agree to false if feature flag is not on', async () => {
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
        doMount();
        const users = [
          {
            entity: {
              roles: [{ optionItemId: '1' }],
            },
            metadata: {
              teams: [
                {
                  events: [
                    { id: 'A' },
                  ],
                },
              ],
            },
          },
          {
            entity: {
              roles: [{ optionItemId: '1' }],
            },
            metadata: {
              teams: [
                {
                  events: [
                    { id: 'B' },
                  ],
                },
              ],
            },
          }];
        const targetRoles = ['1', '2'];
        const targetEvent = 'B';
        wrapper.vm.$storage.userAccount.actions.search = jest.fn(() => ({ ids: [] }));
        wrapper.vm.$storage.userAccount.getters.getByIds = jest.fn(() => users);

        // eslint-disable-next-line max-len
        const filter = 'Entity/Roles/any(role:role/OptionItemId eq \'1\' or role/OptionItemId eq \'2\') and Metadata/Teams/any(team:team/Events/any(event:event/Id eq \'B\'))';
        await wrapper.vm.getUsersByRolesAndEvent(targetRoles, targetEvent);

        expect(wrapper.vm.$storage.userAccount.actions.search).toHaveBeenCalledWith({ filter });
        expect(wrapper.vm.users).toEqual(users);
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

      it('should call getUsersByRolesAndEvent with proper event id and roles from the first group of approval table', async () => {
        doMount();
        wrapper.vm.getUsersByRolesAndEvent = jest.fn();
        await wrapper.vm.fetchDataForApproval();
        expect(wrapper.vm.getUsersByRolesAndEvent).toBeCalledWith(mockApprovalTableData().groups[0].roles, 'eventId');
      });
    });
  });
});
