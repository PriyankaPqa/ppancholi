/* eslint-disable */
import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockProgramEntity, EPaymentModalities } from '@/entities/program';
import { mockItems } from '@/entities/financial-assistance';
import { mockCaseFinancialAssistancePaymentGroups, PaymentStatus } from '@/entities/financial-assistance-payment';
import Component from '../CreateEditPaymentLineDialog.vue';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { AddressForm } from '@crctech/registration-lib';
import { mockAddressData, Address, mockAddress } from '@crctech/registration-lib/src/entities/value-objects/address';

const localVue = createLocalVue();
const program = mockProgramEntity();
const items = mockItems();
const storage = mockStorage();
let caseFileFinancialAssistanceGroup = mockCaseFinancialAssistancePaymentGroups()[0];
libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);

describe('CreateEditPaymentLineDialog.vue', () => {
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
      mocks: {
        $storage: storage,
      },
      computed: {
        apiKey() {
          return 'mock-apiKey';
        },
      },
      stubs: {
        RcGoogleAutocomplete: true,
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

    describe('txt_amount', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('txt_amount').exists()).toBeTruthy();
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
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher }, paymentStatus: PaymentStatus.New } });
        expect(wrapper.findDataTest('txt_actualamount').vm.$attrs.disabled).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher }, paymentStatus: PaymentStatus.Issued } });
        expect(wrapper.findDataTest('txt_actualamount').vm.$attrs.disabled).toBeTruthy();
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Voucher }, paymentStatus: PaymentStatus.Completed } });
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

      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          program,
          items,
        },
        mocks: {
          $storage: storage,
        },
        computed: {
          apiKey() {
            return 'mock-apiKey';
          },
        },
        stubs: {
          RcGoogleAutocomplete: true,
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
      it('sets the right initial data when adding', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentGroup).toEqual({
          created: '',
          createdBy: '',
          eTag: '',
          groupingInformation:
          {
            modality: null,
            payeeName: 'John Joe',
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
              documentReceived: false,
              id: '',
              mainCategoryId: null,
              relatedNumber: null,
              subCategoryId: null,
              tenantId: '',
              timestamp: '',
              status: 1,
              created: '',
              createdBy: '',
              eTag: '',
              lastUpdatedBy: '',
            },
          ],
          paymentStatus: 1,
          status: 2,
          tenantId: '',
          timestamp: '',
        });
      });

      it('sets the right initial data when updating', async () => {
        await wrapper.setProps({currentLine: caseFileFinancialAssistanceGroup.lines[0], currentGroup: caseFileFinancialAssistanceGroup});
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentGroup).toEqual({
          created: '',
          createdBy: '',
          eTag: '',
          groupingInformation:
          {
            modality: 2,
            payeeName: 'thl',
            payeeType: 1,
          },
          id: '',
          lastUpdatedBy: '',
          lines: [
            {
              ...caseFileFinancialAssistanceGroup.lines[0]
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
        expect(wrapper.vm.defaultBeneficiaryData.name).toEqual('John Joe');
        expect(wrapper.vm.defaultBeneficiaryData.address.streetAddress).not.toBeNull();
      });

      it('sets the address from household when none already set', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(storage.household.actions.fetch).toHaveBeenCalledWith(storage.caseFile.getters.get().entity.householdId);
        expect(wrapper.vm.address.streetAddress).not.toBeNull();
        expect(wrapper.vm.address).toEqual(storage.household.actions.fetch().entity.address.address);
      });

      it('sets the predefined address when one already set', async () => {
        caseFileFinancialAssistanceGroup.lines[0].address = mockAddressData();
        caseFileFinancialAssistanceGroup.lines[0].address.streetAddress = 'abc street';
        await wrapper.setProps({currentLine: caseFileFinancialAssistanceGroup.lines[0], currentGroup: caseFileFinancialAssistanceGroup});
        
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.address.streetAddress).toEqual('abc street');
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
      it('accepts data from payee when Cheque', async () => {
        await wrapper.setData({ paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 99, payeeName: 'manual' } } });
        wrapper.vm.currentPaymentLine.careOf = 'blah';
        await wrapper.setData({address: mockAddressData()});
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
        await wrapper.setData({address: mockAddressData()});
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        const emitted = wrapper.emitted('submit')[0][0];
        expect(emitted.groupingInformation.modality).toEqual(EPaymentModalities.Invoice);
        expect(emitted.groupingInformation.payeeType).toEqual(1);
        expect(emitted.groupingInformation.payeeName).not.toEqual('manual');
        expect(emitted.lines[0].address).toBeNull();
        expect(emitted.lines[0].careOf).toBeNull();
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

      it('should call resetDocuments', async () => {
        jest.spyOn(wrapper.vm, 'resetDocuments').mockImplementation(() => {});
        await wrapper.setData({ paymentGroup: caseFileFinancialAssistanceGroup });
        await wrapper.vm.resetSubCategory();
        expect(wrapper.vm.resetDocuments).toHaveBeenCalled();
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
        await wrapper.setData({ address: new Address(), paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 2, payeeName: 'manual' } } });
        await wrapper.setData({ defaultBeneficiaryData: { name: 'myNewName', address: new Address(mockAddressData()) } });

        await wrapper.setData({ paymentGroup: { groupingInformation: { payeeType: 1 } } });
        wrapper.vm.resetPayeeInformation();
        const expected = new Address(mockAddressData());
        expect(wrapper.vm.address).toEqual(expected);
        expect(wrapper.vm.paymentGroup.groupingInformation.payeeName).toEqual('myNewName');
      });
      it('clears payee information when third party', async () => {
        await wrapper.setData({ address: new Address(mockAddressData()), paymentGroup: { groupingInformation: { modality: EPaymentModalities.Cheque, payeeType: 1, payeeName: 'myNewName' } } });
        await wrapper.setData({ defaultBeneficiaryData: { name: 'myNewName', address: new Address(mockAddressData()) } });

        await wrapper.setData({ paymentGroup: { groupingInformation: { payeeType: 2 } } });
        wrapper.vm.resetPayeeInformation();
        const expected = new Address(mockAddressData());
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
