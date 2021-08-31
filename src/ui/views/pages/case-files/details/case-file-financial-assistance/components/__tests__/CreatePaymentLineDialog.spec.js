/* eslint-disable */
import { createLocalVue, mount } from '@/test/testSetup';
import { mockProgramEntity } from '@/entities/program';
import { mockItems } from '@/entities/financial-assistance';
import { mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';
import Component from '../CreatePaymentLineDialog.vue';

const localVue = createLocalVue();
const program = mockProgramEntity();
const items = mockItems();
let caseFileFinancialAssistanceGroup = mockCaseFinancialAssistancePaymentGroups()[0];

describe('CaseFileFinancialAssistancePaymentLineDialog.vue', () => {
  let wrapper;

  beforeEach(async () => {
    caseFileFinancialAssistanceGroup = mockCaseFinancialAssistancePaymentGroups()[0];
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        show: true,
        program,
        items,
      },
    });

    await wrapper.vm.$nextTick();
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
    });

    describe('checkbox_consent', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('checkbox_consent').exists()).toBeTruthy();
      });
    });

    describe('reason_specified_other', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('reason_specified_other').exists()).toBeTruthy();
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

    describe('reason_specified_other', () => {
      it('is rendered', () => {
        const element = wrapper.findDataTest('reason_specified_other');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.amount);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          program,
          items,
        },
      });

      await wrapper.vm.$nextTick();
    });

    describe('paymentModalities', () => {
      it('should return the list of payment modalities', () => {
        expect(wrapper.vm.paymentModalities).toEqual([
          { value: 2, text: 'Cheque' },
          { value: 3, text: 'Direct deposit' },
          { value: 4, text: 'Gift card' },
          { value: 5, text: 'Invoice' },
          { value: 6, text: 'Prepaid card' },
          { value: 7, text: 'Voucher' },
        ]);
      });
    });

    describe('subItems', () => {
      it('should return the list of subItem matching the selected item', () => {
        wrapper.vm.currentPaymentLine.mainCategoryId = items[0].mainCategory.id;
        expect(wrapper.vm.subItems).toEqual(items[0].subItems);
      });
    });
  });

  describe('Methods', () => {
    describe('initCreateMode', () => {
      it('sets the right call centre data', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentGroup).toEqual({
          created: '',
          createdBy: '',
          eTag: '',
          groupingInformation:
          {
            modality: null,
            payeeName: 'undefined undefined',
            payeeType: 1,
          },
          id: '',
          lastUpdatedBy: '',
          lines: [
            {
              actualAmount: 0,
              address: null,
              amount: null,
              careOf: null,
              documentReceived: null,
              mainCategoryId: null,
              relatedNumber: null,
              subCategoryId: null,
            },
          ],
          paymentStatus: 1,
          status: 2,
          tenantId: '',
          timestamp: '',
        });
      });
    });

    describe('resetDocuments', () => {
      it('should reset documentReceived', async () => {
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeTruthy();
        await wrapper.vm.resetDocuments();
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeFalsy();
      });
    });

    describe('onSubmit', () => {
      it('sets amount as a number (as text field will return text)', async () => {
        caseFileFinancialAssistanceGroup.lines[0].amount = '100';
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.paymentGroup.lines[0].amount).toBe(100);
      });

      it('doesnt proceed unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')).toBeFalsy();
      });
    });

    describe('resetDocuments', () => {
      it('should reset documentReceived', async () => {
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeTruthy();
        await wrapper.vm.resetDocuments();
        expect(wrapper.vm.currentPaymentLine.documentReceived).toBeFalsy();
      });
    });

    describe('onSubmit', () => {
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

      it('should call resetDocuments', async () => {
        jest.spyOn(wrapper.vm, 'resetDocuments').mockImplementation(() => {});
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.resetSubCategory();
        expect(wrapper.vm.resetDocuments).toHaveBeenCalled();
      });
    });
  });
});
