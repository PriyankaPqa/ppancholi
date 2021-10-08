/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import { mockStorage } from '@/store/storage';
import Component from '../PaymentLineGroup.vue';
import { mockCaseFinancialAssistancePaymentGroups, PaymentStatus } from '@/entities/financial-assistance-payment';
import { Status } from '@/entities/base';
import { mockProgramEntity, EPaymentModalities } from '@/entities/program';

const localVue = createLocalVue();
const items = mockItems();
let paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
let program = mockProgramEntity();
const storage = mockStorage();

describe('PaymentLineGroup.vue', () => {
  let wrapper;
  
  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        paymentGroup,
          items,
          program,
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
      jest.clearAllMocks();
      paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];

      await mountWrapper();
    });

    describe('paymentLineGroup__title', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineGroup__title').exists()).toBeTruthy();
      });
    });

    describe('paymentLineGroup__total', () => {
      it('renders when not cancelled', async () => {
        expect(wrapper.findDataTest('paymentLineGroup__total').exists()).toBeTruthy();
        wrapper.vm.paymentGroup.paymentStatus = 6;
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__total').exists()).toBeFalsy();
      });
    });

    describe('paymentLineGroup__status', () => {
      it('renders when not new payment', async () => {
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__status').exists()).toBeFalsy();
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__status').exists()).toBeTruthy();
      });
    });

    describe('warning paymentLineGroup__paymentMustBeSubmitted', () => {
      it('renders when new payment', async () => {
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__paymentMustBeSubmitted').exists()).toBeFalsy();
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__paymentMustBeSubmitted').exists()).toBeTruthy();
      });
    });
  });
  
  describe('Lifecycle', () => {
    describe('created', () => {
      it('shows a message if the data is inactive', async () => {
        paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
    
        await mountWrapper(false, 6, null, {
          computed: {
            isInactive: () => true,
          }
        });

        jest.clearAllMocks();
        let hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).toHaveBeenCalled();

        
        await mountWrapper(false, 6, null, {
          computed: {
            isInactive: () => false,
          }
        });
        hook = wrapper.vm.$options.created[0];
        jest.clearAllMocks();
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).not.toHaveBeenCalled();

      });
    });
  });

  describe('Computed', () => {

    beforeEach(async () => {
      jest.clearAllMocks();
      paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
  
      await mountWrapper();
    });

    describe('title', () => {
      it('should return the modality + payeeType + payee name when cheque', () => {
        expect(wrapper.vm.title).toBe('Cheque (Beneficiary) - thl');
        wrapper.vm.paymentGroup.groupingInformation = {
          modality: 2,
          payeeType: 2,
          payeeName: 'abc',
        };
        expect(wrapper.vm.title).toBe('Cheque (Third-party) - abc');
      });

      it('should return the modality if it isnt Cheque', () => {
        wrapper.vm.paymentGroup.groupingInformation = {
          modality: 1,
          payeeType: 2,
          payeeName: 'abc',
        };
        expect(wrapper.vm.title).toBe('E-Transfer');
      });
    });

    describe('isInactive', () => {
      it('returns whether the current modality is not available when the payment is still new', async () => {
        wrapper.vm.paymentGroup.groupingInformation = { modality: 2, payeeType: 2 };
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.setProps({ program: { paymentModalities: [1, 2] } });
        expect(wrapper.vm.isInactive).toBeFalsy();
        await wrapper.setProps({ program: { paymentModalities: [1] } });
        expect(wrapper.vm.isInactive).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.setProps({ program: { paymentModalities: [1, 2] } });
        expect(wrapper.vm.isInactive).toBeFalsy();
      });
    });

    describe('activeLines', () => {
      it('should filter out inactive lines', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 4562.15, status: Status.Active });
        paymentGroup.lines.push({ amount: 123, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Inactive });
        expect(wrapper.vm.activeLines).toEqual([paymentGroup.lines[0], paymentGroup.lines[1]]);
      });
    });

    describe('total', () => {
      it('should return the total value of payment group', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 4562.15, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Active });
        expect(wrapper.vm.total).toEqual(4562.15 + 123.55);
      });

      it('should ignore inactive lines', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 123, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Inactive });
        expect(wrapper.vm.total).toEqual(123);
      });
    });

    describe('modality', () => {
      it('should return name of the selected modality in lowercase', () => {
        expect(wrapper.vm.modality).toEqual('event.programmanagement.paymentmodalities.cheque');
      });
    });
    
    describe('paymentStatusesByModality', () => {
      it('should return only the current status for contributors not finance', async () => {
        paymentGroup.paymentStatus = 2;
        await mountWrapper(false, null, 'contributorIM');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([2]);
        paymentGroup.paymentStatus = 3;
        await mountWrapper(false, null, 'contributorIM');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([3]);
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([3]);
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([3]);
      });
      
      /*
        based on the excel grid of statuses available according to your role and current modality
        see https://rctech.atlassian.net/browse/EMISV2-673
      */
      it('etransfer level6 PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress only if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });
    
      it('etransfer contributor finance PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress only if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Sent, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('etransfer level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });

      it('etransfer level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('Cheque level6 PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress only if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Cheque;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });
      
      it('Cheque contributorFinance PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress only if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Cheque;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('Cheque level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Cheque;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });

      it('Cheque level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Cheque;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      
      it('DirectDeposit level6 PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress even if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.DirectDeposit;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('DirectDeposit contributorFinance PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled - InProgress even if not new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.DirectDeposit;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.InProgress, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('DirectDeposit level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.DirectDeposit;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('DirectDeposit level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.DirectDeposit;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('Voucher level6 PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Voucher;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });
      
      it('Voucher contributorFinance PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Voucher;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('Voucher level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Voucher;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('Voucher level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Voucher;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('Invoice level6 PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });
      
      it('Invoice contributorFinance PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('Invoice level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('Invoice level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      
      it('PrepaidCard level6 PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.PrepaidCard;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });
      
      it('PrepaidCard contributorFinance PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.PrepaidCard;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
      });

      it('PrepaidCard level1 only current status or Completed only when New', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.PrepaidCard;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
        
        paymentGroup.paymentStatus = PaymentStatus.Cancelled;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Cancelled]);
      });
      
      it('PrepaidCard level3 only current status + completed or cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.PrepaidCard;
        paymentGroup.paymentStatus = PaymentStatus.New;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.New, PaymentStatus.Completed, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Completed;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Completed]);
      });
      
      it('GiftCard level6 PaymentStatus.Issued, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.GiftCard;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 6);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Cancelled;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
      });
      
      it('GiftCard contributorFinance PaymentStatus.Issued, PaymentStatus.Cancelled', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.GiftCard;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Cancelled;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
      });

      it('GiftCard level1 only current status', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.GiftCard;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 1);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued]);
        
        paymentGroup.paymentStatus = PaymentStatus.Cancelled;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Cancelled]);
      });
      
      it('GiftCard level3 only current status + cancelled if new', async () => {
        paymentGroup.groupingInformation.modality = EPaymentModalities.GiftCard;
        paymentGroup.paymentStatus = PaymentStatus.Issued;
        await mountWrapper(false, 3);
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Issued, PaymentStatus.Cancelled]);
        
        paymentGroup.paymentStatus = PaymentStatus.Cancelled;
        expect(wrapper.vm.paymentStatusesByModality).toEqual([PaymentStatus.Cancelled]);
      });
    });
  });
  
  describe('Methods', () => {
    describe('onPaymentStatusChange', () => {
  
      it('should emit update-payment-status', async () => {
        await mountWrapper();
        await wrapper.vm.onPaymentStatusChange(3);
        expect(wrapper.emitted('update-payment-status')[0][0]).toEqual({ status: 3, group: wrapper.vm.paymentGroup });
      });
    });
  });
});
