import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockProgramEntity, EPaymentModalities } from '@libs/entities-lib/program';
import { mockItemsWithBasicData } from '@libs/entities-lib/financial-assistance';
import { mockCaseFinancialAssistanceEntity, mockCaseFinancialAssistancePaymentGroups, ApprovalStatus } from '@libs/entities-lib/financial-assistance-payment';
import libHelpers from '@libs/entities-lib/helpers';
import AddressForm from '@libs/registration-lib/src/components/forms/AddressForm.vue';
import { mockAddressData, Address } from '@libs/entities-lib/value-objects/address';
import { Status } from '@libs/shared-lib/types';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { mockMember } from '@libs/entities-lib/value-objects/member';

import Component from '../CreateEditPaymentLineDialog.vue';

const localVue = createLocalVue();
const program = mockProgramEntity();
let financialAssistance = mockCaseFinancialAssistanceEntity();
const items = mockItemsWithBasicData();

let caseFileFinancialAssistanceGroup = mockCaseFinancialAssistancePaymentGroups()[0];
libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);
const { pinia } = useMockCaseFileStore();

describe('CreateEditPaymentLineDialog.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    additionalOverwrites.computed = additionalOverwrites.computed || {};
    additionalOverwrites.computed.primaryMember = additionalOverwrites.computed.primaryMember || jest.fn(() => mockMember());
    additionalOverwrites.computed.household = additionalOverwrites.computed.household || jest.fn(() => mockHouseholdEntity());
    additionalOverwrites.computed.apiKey = additionalOverwrites.computed.apiKey || jest.fn(() => 'mock-apiKey');

    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        program,
        items,
        financialAssistance,
        id: 'cfid',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      stubs: {
        RcGoogleAutocomplete: true,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    caseFileFinancialAssistanceGroup = mockCaseFinancialAssistancePaymentGroups()[0];
    financialAssistance = mockCaseFinancialAssistanceEntity();
    jest.clearAllMocks();

    await mountWrapper();
  });

  describe('Template', () => {
    describe('payment_title', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('payment_title').exists()).toBeTruthy();
      });
    });

    describe('payment_item', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('payment_item').exists()).toBeTruthy();
      });
    });

    describe('payment_subItem', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('payment_subItem').exists()).toBeTruthy();
      });
    });

    describe('payment_modalities', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('payment_modalities').exists()).toBeTruthy();
      });

      it('is disabled once payment is completed', async () => {
        financialAssistance.approvalStatus = null;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('payment_modalities').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('payment_modalities').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('payment_modalities').vm.$attrs.disabled).toBeTruthy();
      });
    });

    describe('checkbox_documentReceived', () => {
      it('is rendered depending on documentationRequired', async () => {
        expect(wrapper.findDataTest('checkbox_documentReceived').exists()).toBeFalsy();
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-0', mainCategoryId: 'm-0' } });
        expect(wrapper.findDataTest('checkbox_documentReceived').exists()).toBeFalsy();
        // s-0-1 has documentationRequired= 1
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-1', mainCategoryId: 'm-0' } });
        expect(wrapper.findDataTest('checkbox_documentReceived').exists()).toBeTruthy();
        expect(wrapper.findDataTest('checkbox_documentReceived').props('rules')).toEqual(wrapper.vm.rules.documentReceived);
      });
    });

    describe('txt_amount', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('txt_amount').exists()).toBeTruthy();
      });

      it('is disabled once payment is completed', async () => {
        financialAssistance.approvalStatus = null;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_amount').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_amount').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_amount').vm.$attrs.disabled).toBeTruthy();
      });
    });

    describe('txt_actualamount', () => {
      it(' is shown for Voucher and invoice', async () => {
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.DirectDeposit } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.GiftCard } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Invoice } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.PrepaidCard } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_actualamount').exists()).toBeTruthy();
      });

      it('is disabled until payment is completed', async () => {
        financialAssistance.approvalStatus = null;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_actualamount').vm.$attrs.disabled).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_actualamount').vm.$attrs.disabled).toBeTruthy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_actualamount').vm.$attrs.disabled).toBeFalsy();
      });
    });

    describe('txt_related_number', () => {
      it(' is shown for Voucher, invoice, gift card, prepaid', async () => {
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.DirectDeposit } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.GiftCard } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Invoice } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.PrepaidCard } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_related_number').exists()).toBeTruthy();
      });

      it('is not disabled regardless of status', async () => {
        financialAssistance.approvalStatus = null;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_related_number').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.New;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_related_number').vm.$attrs.disabled).toBeFalsy();
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('txt_related_number').vm.$attrs.disabled).toBeFalsy();
      });
    });

    describe('payeeSection', () => {
      it(' is shown for Cheque', async () => {
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.DirectDeposit } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.GiftCard } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Invoice } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.PrepaidCard } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher } } });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
      });
    });

    describe('AddressForm', () => {
      it('should be displayed if Cheque', async () => {
        expect(wrapper.findComponent(AddressForm).exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        expect(wrapper.findComponent(AddressForm).exists()).toBeFalsy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        expect(wrapper.findComponent(AddressForm).exists()).toBeTruthy();
      });

      it('should trigger setAddress event @change', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        wrapper.vm.setAddress = jest.fn();
        const component = wrapper.findComponent(AddressForm);
        await component.vm.$emit('change');
        expect(wrapper.vm.setAddress).toHaveBeenCalledTimes(1);
      });

      it('should pass Prop isEditMode', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        const component = wrapper.findComponent(AddressForm);
        const props = 'isEditMode';
        expect(component.props(props)).toBe(true);
      });
    });

    describe('E-transfer', () => {
      it('should display email information when payment method is E-transfer and there is an email', async () => {
        await wrapper.setData({
          paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } },
          defaultBeneficiaryData: { email: 'mockemail@gmail.com' },
        });
        const element = wrapper.findDataTest('payment_eTransfer_email');
        expect(element.exists()).toBe(true);
      });

      it('should not display no-email notification when payment method is E-transfer and there is not an email', async () => {
        await wrapper.setData({
          paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } },
          defaultBeneficiaryData: { email: '' },
        });
        const element = wrapper.findDataTest('payment_eTransfer_noEmail');
        expect(element.exists()).toBe(true);
      });
    });
  });

  describe('Validation rules', () => {
    describe('payment_item', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('payment_item');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.item);
      });
    });

    describe('payment_subItem', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('payment_subItem');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.subitem);
      });
    });

    describe('payment_modalities', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('payment_modalities');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.modalities);
      });
    });

    describe('txt_amount', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('txt_amount');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.amount);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await mountWrapper();
    });

    describe('paymentModalities', () => {
      it('should return the list of payment modalities', () => {
        expect(wrapper.vm.paymentModalities).toEqual([
          { value: 2, text: 'Cheque', dataTest: 'Cheque' },
          { value: 3, text: 'Direct deposit', dataTest: 'DirectDeposit' },
          { value: 4, text: 'Gift card', dataTest: 'GiftCard' },
          { value: 5, text: 'Invoice', dataTest: 'Invoice' },
          { value: 6, text: 'Prepaid card', dataTest: 'PrepaidCard' },
          { value: 7, text: 'Voucher', dataTest: 'Voucher' },
        ]);
      });
    });

    describe('activeItems', () => {
      it('filters items either active or currently selected', async () => {
        let items = mockItemsWithBasicData();
        await wrapper.setProps({ items });
        expect(wrapper.vm.activeItems).toEqual(items);

        items = mockItemsWithBasicData();
        items[0].status = Status.Inactive;
        await wrapper.setProps({ items });

        expect(wrapper.vm.activeItems).toEqual(items.filter((i, index) => index > 0));
        wrapper.vm.currentPaymentLine.mainCategoryId = items[0].mainCategory.id;
        expect(wrapper.vm.activeItems).toEqual(items);
      });
    });

    describe('subItems', () => {
      it('should return the list of subItem matching the selected item', () => {
        wrapper.vm.currentPaymentLine.mainCategoryId = items[0].mainCategory.id;
        expect(wrapper.vm.subItems).toEqual(items[0].subItems);
      });

      it('filters items either active or currently selected', async () => {
        let items = mockItemsWithBasicData();
        wrapper.vm.currentPaymentLine.mainCategoryId = items[0].mainCategory.id;
        await wrapper.setProps({ items });
        expect(wrapper.vm.subItems).toEqual(items[0].subItems);

        items = mockItemsWithBasicData();
        items[0].subItems[0].status = Status.Inactive;
        await wrapper.setProps({ items });

        expect(wrapper.vm.subItems).toEqual(items[0].subItems.filter((i, index) => index > 0));
        wrapper.vm.currentPaymentLine.subCategoryId = items[0].subItems[0].subCategory.id;
        expect(wrapper.vm.subItems).toEqual(items[0].subItems);
      });
    });

    describe('modalityError', () => {
      it('returns an error when Etransfer and no email', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        await wrapper.setData({ defaultBeneficiaryData: { email: 'myEmail' } });
        expect(wrapper.vm.modalityError).toBeNull();
        await wrapper.setData({ defaultBeneficiaryData: { email: null } });
        expect(wrapper.vm.modalityError).toBe('caseFile.financialAssistance.ETransfer.noEmail.individual');
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque } } });
        expect(wrapper.vm.modalityError).toBeNull();
      });
    });

    describe('amountError', () => {
      it('returns an error when Etransfer total > 10000', async () => {
        const financialAssistance = mockCaseFinancialAssistanceEntity();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.ETransfer } } });
        wrapper.vm.currentPaymentLine.amount = 9999;
        await wrapper.setProps({ financialAssistance: { ...financialAssistance } });
        expect(wrapper.vm.amountError).toBeNull();

        financialAssistance.groups[0].groupingInformation.modality = EPaymentModalities.ETransfer;
        financialAssistance.groups[0].lines[0].amount = 1;
        await wrapper.setProps({ financialAssistance: { ...financialAssistance } });
        expect(wrapper.vm.amountError).toBeNull();

        financialAssistance.groups[0].lines[0].amount = 2;
        await wrapper.setProps({ financialAssistance: { ...financialAssistance } });
        expect(wrapper.vm.amountError).toEqual({ key: 'caseFile.financialAssistance.ETransfer.moreThanX', params: [{ maximumAmount: 10000 }] });

        financialAssistance.groups[0].groupingInformation.modality = EPaymentModalities.Cheque;
        await wrapper.setProps({ financialAssistance: { ...financialAssistance } });
        expect(wrapper.vm.amountError).toBeNull();
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          featureList: [wrapper.vm.$featureKeys.AddressAutoFill],
          propsData: {
            show: true,
            program,
            items,
            financialAssistance,
            id: 'cfid',
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            program,
            items,
            financialAssistance,
            id: 'cfid',
          },
        });
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    describe('initCreateMode', () => {
      it('sets the right initial data when adding', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentGroup).toEqual({
          created: '',
          createdBy: '',
          groupingInformation:
          {
            modality: null,
            payeeName: 'Bob Smith',
            payeeType: 1,
          },
          id: '',
          lastAction: '',
          lastActionCorrelationId: '',
          lastUpdatedBy: '',
          lines: [
            {
              actualAmount: null,
              address: null,
              amount: null,
              cancellationBy: null,
              cancellationDate: null,
              cancellationReason: null,
              careOf: null,
              documentReceived: false,
              id: '',
              paymentStatus: null,
              mainCategoryId: null,
              relatedNumber: null,
              subCategoryId: null,
              tenantId: '',
              timestamp: '',
              status: 1,
              created: '',
              createdBy: '',
              lastUpdatedBy: '',
              lastAction: '',
              lastActionCorrelationId: '',
            },
          ],
          paymentStatus: 1,
          status: 2,
          tenantId: '',
          timestamp: '',
        });
      });

      it('sets the right initial data when updating', async () => {
        await wrapper.setProps({ currentLine: caseFileFinancialAssistanceGroup.lines[0], currentGroup: caseFileFinancialAssistanceGroup });
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentGroup).toEqual({
          created: '',
          createdBy: '',
          groupingInformation:
          {
            modality: 2,
            payeeName: 'thl',
            payeeType: 1,
          },
          id: '',
          lastUpdatedBy: '',
          lastAction: '',
          lastActionCorrelationId: '',
          lines: [
            {
              ...caseFileFinancialAssistanceGroup.lines[0],
            },
          ],
          paymentStatus: 1,
          status: 2,
          tenantId: '',
          timestamp: '',
        });
      });

      it('sets the defaultBeneficiaryData from household and case file', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.defaultBeneficiaryData.name).toEqual('Bob Smith');
        expect(wrapper.vm.defaultBeneficiaryData.address.streetAddress).not.toBeNull();
        expect(wrapper.vm.defaultBeneficiaryData.email).toBe('test@test.ca');
      });

      it('sets the predefined address when one already set', async () => {
        caseFileFinancialAssistanceGroup.lines[0].address = mockAddressData();
        caseFileFinancialAssistanceGroup.lines[0].address.streetAddress = 'abc street';
        await wrapper.setProps({ currentLine: caseFileFinancialAssistanceGroup.lines[0], currentGroup: caseFileFinancialAssistanceGroup });

        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.address.streetAddress).toEqual('abc street');
      });
    });

    describe('categorySelected', () => {
      it('should reset documentReceived if not passed false', async () => {
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeTruthy();
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeFalsy();
        wrapper.vm.currentPaymentLine.documentReceived = true;

        wrapper.vm.categorySelected(true);
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeFalsy();
        wrapper.vm.currentPaymentLine.documentReceived = true;

        wrapper.vm.categorySelected(false);
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeTruthy();
      });

      it('should reset amount if not passed false and fixed amount changed', async () => {
        // s-0-0 is fixed
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-0', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.amount).toBe(1);

        // s-0-1 is not fixed
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-1', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected(false);
        expect(wrapper.vm.currentPaymentLine.amount).toBe(1);

        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-0', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected();
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-1', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.amount).toBe(null);
      });

      it('should set fixed amount when subitem says so', async () => {
        // s-0-0 is fixed
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-0', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.amount).toBe(1);
        expect(wrapper.vm.fixedAmount).toBeTruthy();
        await wrapper.setData({ currentPaymentLine: { amount: 567 } });
        wrapper.vm.categorySelected(false);
        expect(wrapper.vm.currentPaymentLine.amount).toBe(567);
        expect(wrapper.vm.fixedAmount).toBeTruthy();
        await wrapper.setData({ currentPaymentLine: { amount: 567 } });
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.amount).toBe(1);
        expect(wrapper.vm.fixedAmount).toBeTruthy();
        // s-0-1 is not fixed
        await wrapper.setData({ currentPaymentLine: { subCategoryId: 's-0-1', mainCategoryId: 'm-0' } });
        wrapper.vm.categorySelected();
        expect(wrapper.vm.currentPaymentLine.amount).toBeNull();
        expect(wrapper.vm.fixedAmount).toBeFalsy();
        await wrapper.setData({ currentPaymentLine: { amount: 123 } });
        wrapper.vm.categorySelected(false);
        expect(wrapper.vm.currentPaymentLine.amount).toBe(123);
        expect(wrapper.vm.fixedAmount).toBeFalsy();
      });
    });

    describe('onSubmit', () => {
      it('sets amount as a number (as text field will return text)', async () => {
        await mountWrapper(true);
        caseFileFinancialAssistanceGroup.lines[0].amount = '100';
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.paymentGroup.lines[0].amount).toBe('100.00');
      });

      it('doesnt proceed unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')).toBeFalsy();
      });

      it('accepts data from payee when Cheque', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 99, payeeName: 'manual' } } });
        wrapper.vm.currentPaymentLine.careOf = 'blah';
        await wrapper.setData({ address: mockAddressData() });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        const emitted = wrapper.emitted('submit')[0][0];
        expect(emitted.groupingInformation.modality).toEqual(EPaymentModalities.Cheque);
        expect(emitted.groupingInformation.payeeType).toEqual(99);
        expect(emitted.groupingInformation.payeeName).toEqual('manual');
        expect(emitted.lines[0].address).not.toBeNull();
        expect(emitted.lines[0].address).toEqual(wrapper.vm.address);
        expect(emitted.lines[0].careOf).toEqual('blah');
      });

      it('clears data from payee when not Cheque', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Invoice, payeeType: 99, payeeName: 'manual' } } });
        wrapper.vm.currentPaymentLine.careOf = 'blah';
        await wrapper.setData({ address: mockAddressData() });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        const emitted = wrapper.emitted('submit')[0][0];
        expect(emitted.groupingInformation.modality).toEqual(EPaymentModalities.Invoice);
        expect(emitted.groupingInformation.payeeType).toEqual(1);
        expect(emitted.groupingInformation.payeeName).not.toEqual('manual');
        expect(emitted.lines[0].address).toBeNull();
        expect(emitted.lines[0].careOf).toBeNull();
      });

      it('keeps payee info if approved already', async () => {
        financialAssistance.approvalStatus = ApprovalStatus.Approved;
        await wrapper.setData({ defaultBeneficiaryData: { name: 'myNewName', address: new Address(mockAddressData()) } });
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Invoice, payeeType: 99, payeeName: 'manual' } } });
        wrapper.vm.currentPaymentLine.careOf = 'blah';
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        const emitted = wrapper.emitted('submit')[0][0];
        expect(emitted.groupingInformation.modality).toEqual(EPaymentModalities.Invoice);
        expect(emitted.groupingInformation.payeeType).toEqual(99);
        expect(emitted.groupingInformation.payeeName).toEqual('manual');
        expect(emitted.lines[0].address).toBeNull();
        expect(emitted.lines[0].careOf).toBe('blah');
      });

      it('doesnt proceed unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')).toBeFalsy();
      });

      it('emit submit if validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')[0][0]).toEqual(caseFileFinancialAssistanceGroup);
      });
    });

    describe('resetSubCategory', () => {
      it('should reset the subCategoryId', async () => {
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        expect(wrapper.vm.currentPaymentLine.subCategoryId).not.toEqual(null);
        await wrapper.vm.resetSubCategory();
        expect(wrapper.vm.currentPaymentLine.subCategoryId).toEqual(null);
      });

      it('should call categorySelected', async () => {
        jest.spyOn(wrapper.vm, 'categorySelected').mockImplementation(() => {});
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.resetSubCategory();
        expect(wrapper.vm.categorySelected).toHaveBeenCalled();
      });
    });

    describe('setAddress', () => {
      it('should set the address', async () => {
        await wrapper.setData({
          address: {},
        });

        wrapper.vm.setAddress(mockAddressData());

        const expected = new Address(mockAddressData());

        expect(wrapper.vm.address).toEqual(expected);
      });
    });

    describe('resetPayeeInformation', () => {
      it('sets payee information to the beneficiary info when beneficiary', async () => {
        await wrapper.setData({
          address: new Address(),
          paymentGroup: {
            groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 2, payeeName: 'manual' },
          },
        });
        await wrapper.setData({ defaultBeneficiaryData: { name: 'myNewName', address: new Address(mockAddressData()) } });

        await wrapper.setData({ paymentGroup: { groupingInformation: { payeeType: 1 } } });
        wrapper.vm.resetPayeeInformation();
        const expected = new Address(mockAddressData());
        expect(wrapper.vm.address).toEqual(expected);
        expect(wrapper.vm.paymentGroup.groupingInformation.payeeName).toEqual('myNewName');
      });
      it('clears payee information when third party', async () => {
        await wrapper.setData({
          address: new Address(mockAddressData()),
          paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 1, payeeName: 'myNewName' } },
        });
        await wrapper.setData({ defaultBeneficiaryData: { name: 'myNewName', address: new Address(mockAddressData()) } });

        await wrapper.setData({ paymentGroup: { groupingInformation: { payeeType: 2 } } });
        wrapper.vm.resetPayeeInformation();
        expect(wrapper.vm.address).toEqual(new Address());
        expect(wrapper.vm.paymentGroup.groupingInformation.payeeName).toEqual('');
      });
    });

    describe('onCancel', () => {
      it('emits cancel if the confirmation dialog returns true', async () => {
        wrapper.vm.$refs.form.flags = { dirty: true };
        await wrapper.vm.onCancel();
        expect(wrapper.emitted('cancelChange')).toBeTruthy();
      });

      it('does not emit cancel if the confirmation dialog returns false', async () => {
        wrapper.vm.$refs.form.flags = { dirty: true };
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.onCancel();
        expect(wrapper.emitted('cancelChange')).toBeFalsy();
      });
    });
  });
});
