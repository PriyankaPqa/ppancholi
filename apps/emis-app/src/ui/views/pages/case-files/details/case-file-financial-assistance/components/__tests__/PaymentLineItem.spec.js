import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@libs/entities-lib/financial-assistance';
import { UserRoles } from '@libs/entities-lib/user';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { EPaymentModalities } from '@libs/entities-lib/program/program.types';
import { ApprovalStatus, PaymentLineStatus, mockCaseFinancialAssistancePaymentGroups } from '@libs/entities-lib/financial-assistance-payment';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import flushPromises from 'flush-promises';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { GlobalHandler } from '@libs/services-lib/http-client';
import Component from '../PaymentLineItem.vue';

const localVue = createLocalVue();

const items = mockItems();
const paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
const paymentLine = paymentGroup.lines[0];
const approvalStatus = ApprovalStatus.New;
const { pinia, userAccountStore, userAccountMetadataStore } = useMockUserAccountStore();

describe('CaseFilePaymentLineItem.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        paymentLine,
        paymentGroup,
        approvalStatus,
        items,
        readonly: false,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('paymentLineItem__editBtn', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineItem__editBtn').exists()).toBeTruthy();
      });
    });

    describe('paymentLineItem__deleteBtn', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineItem__deleteBtn').exists()).toBeTruthy();
      });
    });

    describe('cancel button', () => {
      it('is rendered when property is true', async () => {
        await mountWrapper(false, 6, 'role', { computed: { showCancelButton() {
          return true;
        } } });
        expect(wrapper.findDataTest('paymentLineItem__cancelBtn').exists()).toBeTruthy();
      });

      it('is not rendered when property is false', async () => {
        await mountWrapper(false, 6, 'role', { computed: { showCancelButton() {
          return false;
        } } });
        expect(wrapper.findDataTest('paymentLineItem__cancelBtn').exists()).toBeFalsy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('shows a message if the data is inactive', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            isInactive() {
              return true;
            },
          },
        });

        jest.clearAllMocks();
        let hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).toHaveBeenCalled();

        await mountWrapper(false, 6, null, {
          computed: {
            isInactive() {
              return false;
            },
          },
        });

        hook = wrapper.vm.$options.created[0];
        jest.clearAllMocks();
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).not.toHaveBeenCalled();
      });

      it('should fetch userAccount entity and metadata if payment group was canceled by', async () => {
        paymentLine.cancellationBy = 'mock-user-id';

        await mountWrapper(false, 6, null);
        const hook = wrapper.vm.$options.created[0];
        jest.clearAllMocks();
        await hook.call(wrapper.vm);
        await flushPromises();
        expect(userAccountStore.fetch).toHaveBeenCalledWith('mock-user-id');
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id', GlobalHandler.Partial);
      });
    });
  });

  describe('Computed', () => {
    describe('mainItem', () => {
      it('returns the active main item that contains the subitem id from the payment line', async () => {
        await mountWrapper(false);
        const subItem = { ...items[0].subItems[0], subCategory: { id: wrapper.vm.paymentLine.subCategoryId } };
        const testItems = [
          { ...items[0], subItems: [subItem], status: 1 },
          { ...items[0], subItems: [subItem], status: 2 },

        ];
        await wrapper.setProps({ items: testItems });

        expect(wrapper.vm.mainItem).toEqual({ ...items[0], subItems: [subItem], status: 1 });
      });

      it('returns the  main item that contains the subitem id from the payment line', async () => {
        await mountWrapper(false);
        const subItemToFind = { ...items[0].subItems[0], subCategory: { id: wrapper.vm.paymentLine.subCategoryId } };
        const subItemToIgnore = { ...items[0].subItems[0], subCategory: { id: 'whatever' } };
        const testItems = [
          { ...items[0], subItems: [subItemToFind], status: 1 },
          { ...items[0], subItems: [subItemToIgnore], status: 1 },

        ];
        await wrapper.setProps({ items: testItems });

        expect(wrapper.vm.mainItem).toEqual({ ...items[0], subItems: [subItemToFind], status: 1 });
      });

      it('finds the inactive main item that contains the subitem id from the payment line if there no active one', async () => {
        await mountWrapper(false);
        const subItemToFind = { ...items[0].subItems[0], subCategory: { id: wrapper.vm.paymentLine.subCategoryId } };
        const subItemToIgnore = { ...items[0].subItems[0], subCategory: { id: 'whatever' } };

        const testItems = [
          { ...items[0], subItems: [subItemToIgnore], status: 2 },
          { ...items[0], subItems: [subItemToFind], status: 2 },
          { ...items[0], subItems: [subItemToIgnore], status: 1 },
        ];

        await wrapper.setProps({ items: testItems });

        expect(wrapper.vm.mainItem).toEqual({ ...items[0], subItems: [subItemToFind], status: 2 });
      });
    });

    describe('isInactive', () => {
      it('returns whether the current item/subitem is not available when the payment is still new', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            mainItem() {
              return { ...items[0], status: Status.Active };
            },
            subItem() {
              return { ...items[0].subItems[0], status: Status.Active };
            },
          },
        });
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        expect(wrapper.vm.isInactive).toBeFalsy();

        await mountWrapper(false, 6, null, {
          computed: {
            mainItem() {
              return { ...items[0], status: Status.Inactive };
            },
            subItem() {
              return { ...items[0].subItems[0], status: Status.Active };
            },
          },
        });
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        expect(wrapper.vm.isInactive).toBeTruthy();

        await mountWrapper(false, 6, null, {
          computed: {
            mainItem() {
              return { ...items[0], status: Status.Active };
            },
            subItem() {
              return { ...items[0].subItems[0], status: Status.Inactive };
            },
          },
        });
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        expect(wrapper.vm.isInactive).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        expect(wrapper.vm.isInactive).toBeFalsy();
      });
    });

    describe('title', () => {
      it('it should return the name of the mainItem and subtItem linked to the PaymentLine', async () => {
        await mountWrapper();

        expect(wrapper.vm.title).toEqual("Children's Needs > Children's Supplies");
      });
    });

    describe('showEditButton', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showEditButton).toBeTruthy();

        await wrapper.setProps({ readonly: true });
        expect(wrapper.vm.showEditButton).toBeFalsy();

        await mountWrapper(false, null);
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.showEditButton).toBeFalsy();
      });

      it('returns false when status > new and modality doesnt allow for issuedAmount or related number', async () => {
        // current modality doesnt allow for issuedAmount or related number
        await mountWrapper(false, 1);
        expect(wrapper.vm.showEditButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.New });
        expect(wrapper.vm.showEditButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.showEditButton).toBeFalsy();
      });

      it('returns true when status = approved and modality allow for issuedAmount or related number', async () => {
        await mountWrapper(false, 1);
        // modality allows for issuedAmount or related number
        await wrapper.setProps({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.showEditButton).toBeTruthy();
      });

      it('returns true when status = pending and modality allow for  related number', async () => {
        await mountWrapper(false, 1);
        wrapper.vm.showRelatedNumber = jest.fn(() => true);
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Pending });
        expect(wrapper.vm.showEditButton).toBeTruthy();
      });
    });

    describe('showDeleteButton', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await wrapper.setProps({ readonly: true });
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.New });
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
      });
    });

    describe('showCancelButton', () => {
      it('returns true when user is level 6,feature flag is on and status is isCompleted', async () => {
        await mountWrapper(false, 6, 'role', { mocks: { $hasFeature: (f) => f === FeatureKeys.FinancialAssistanceRemovePaymentLine, $hasLevel: () => true },
        });
        await wrapper.setProps({ isCompleted: true });
        expect(wrapper.vm.showCancelButton).toBeTruthy();
      });

      it('returns false if user is not level 6 ', async () => {
        await mountWrapper(false, 5, 'role', { mocks: { $hasFeature: (f) => f === FeatureKeys.FinancialAssistanceRemovePaymentLine, $hasLevel: () => false },
        });
        await wrapper.setProps({ isCompleted: true });
        expect(wrapper.vm.showCancelButton).toBeFalsy();
      });

      it('returns false if feature flag is off ', async () => {
        await mountWrapper(false, 6, 'role', { mocks: { $hasFeature: (f) => f !== FeatureKeys.FinancialAssistanceRemovePaymentLine },
        });
        await wrapper.setProps({ isCompleted: true });
        expect(wrapper.vm.showCancelButton).toBeFalsy();
      });

      it('returns false if status is not isCompleted', async () => {
        await mountWrapper(false, 6, 'role', { mocks: { $hasFeature: (f) => f === FeatureKeys.FinancialAssistanceRemovePaymentLine },
        });
        await wrapper.setProps({ isCompleted: false });
        expect(wrapper.vm.showCancelButton).toBeFalsy();
      });

      it('returns false if line paymentstatus is cancelled', async () => {
        paymentLine.paymentStatus = PaymentLineStatus.Cancelled;
        paymentLine.cancellationBy = 'id';
        paymentLine.cancellationDate = 'today';
        await mountWrapper(false, 6, 'role', { mocks: { $hasFeature: (f) => f === FeatureKeys.FinancialAssistanceRemovePaymentLine },
        });
        await wrapper.setProps({ isCompleted: false });
        expect(wrapper.vm.showCancelButton).toBeFalsy();
      });
    });

    describe('amounts', () => {
      it('returns data according to modality', async () => {
        await mountWrapper(false, 1);
        await wrapper.setProps({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        await wrapper.setProps({ paymentLine: { amount: 99.55, actualAmount: 3.42 } });
        expect(wrapper.vm.amounts).toEqual('$99.55');
        await wrapper.setProps({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.vm.amounts).toEqual('caseFile.financialAssistance.issuedAmountSmall: $99.55 caseFile.financialAssistance.actualAmountSmall: $3.42');
        await wrapper.setProps({ paymentLine: { amount: 99.55, actualAmount: null } });
        expect(wrapper.vm.amounts).toEqual('caseFile.financialAssistance.issuedAmountSmall: $99.55 caseFile.financialAssistance.actualAmountSmall: —');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('onClickEdit', () => {
      it('should emit an edit-payment-line', () => {
        const paymentLine = paymentGroup.lines[0];
        wrapper.vm.onClickEdit();
        expect(wrapper.emitted('edit-payment-line')[0][0]).toEqual({ line: paymentLine, group: paymentGroup });
      });
    });

    describe('onClickDelete', () => {
      it('should not emit an delete-payment-line if disableDeleteButton', async () => {
        await wrapper.setProps({ disableDeleteButton: true });
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')).toBeUndefined();
      });

      it('should emit an delete-payment-line if confirmed', async () => {
        const paymentLine = paymentGroup.lines[0];
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')[0][0]).toEqual({ line: paymentLine, group: paymentGroup });
      });

      it('should not emit an delete-payment-line if not confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')).toBeUndefined();
      });
    });

    describe('onClickCancel', () => {
      it('should emit an cancel-payment-line if confirmed', async () => {
        const paymentLine = paymentGroup.lines[0];
        await wrapper.vm.onClickCancel();
        expect(wrapper.emitted('cancel-payment-line')[0][0]).toEqual({ lineId: paymentLine.id });
      });

      it('should not emit an cancel-payment-line if not confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.onClickCancel();
        expect(wrapper.emitted('cancel-payment-line')).toBeUndefined();
      });

      it('should set showCancellationReasonSelect to true if payment modality is ETransfer', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        await mountWrapper(false);
        await wrapper.vm.onClickCancel();
        expect(wrapper.vm.showCancellationReasonSelect).toBeTruthy();
      });
    });

    describe('linkToPaymentLineDetails', () => {
      it('returns the detail route', async () => {
        await mountWrapper();
        wrapper.vm.linkToPaymentLineDetails();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.financialAssistance.paymentLineDetails.name,
          params: {
            financialAssistancePaymentLineId: wrapper.vm.paymentLine.id,
          },
        });
      });
    });

    describe('onCancelWithReason', () => {
      it('sets showCancellationReasonSelect to false', async () => {
        wrapper.setData({ showCancellationReasonSelect: true });
        await wrapper.vm.onCancelWithReason(1);
        expect(wrapper.vm.showCancellationReasonSelect).toBeFalsy();
      });

      it('emits cancel-payment-line', async () => {
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.onCancelWithReason(1);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('cancel-payment-line', { lineId: wrapper.vm.paymentLine.id, reason: 1 });
      });
    });
  });
});
