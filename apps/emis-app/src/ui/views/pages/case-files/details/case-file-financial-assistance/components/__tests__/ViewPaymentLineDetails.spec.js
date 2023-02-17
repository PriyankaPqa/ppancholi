import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockFinancialAssistanceTableEntity, mockSubItemData } from '@libs/entities-lib/financial-assistance';
import { mockCaseFinancialAssistanceEntity, mockCaseFinancialAssistancePaymentGroups } from '@libs/entities-lib/financial-assistance-payment';

import flushPromises from 'flush-promises';
import { EPaymentModalities } from '@libs/entities-lib/program/program.types';
import householdHelpers from '@/ui/helpers/household';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import Component from '../ViewPaymentLineDetails.vue';

const localVue = createLocalVue();

let financialAssistance = mockCaseFinancialAssistanceEntity({ id: '1' });
let paymentGroup = financialAssistance.groups[0];
let line = paymentGroup.lines[0];

const { pinia, programStore } = useMockProgramStore();
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);
const { financialAssistanceStore } = useMockFinancialAssistanceStore(pinia);
const { caseFileStore } = useMockCaseFileStore(pinia);

financialAssistanceStore.getById = jest.fn(() => mockFinancialAssistanceTableEntity());

describe('ViewPaymentLineDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    financialAssistance = mockCaseFinancialAssistanceEntity();
    paymentGroup = financialAssistance.groups[0];
    line = paymentGroup.lines[0];

    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        financialAssistancePaymentLineId: line.id,
        financialAssistancePaymentId: financialAssistance.id,
        id: 'cfid',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    await flushPromises();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('detail_modality', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('detail_modality').text()).toEqual('enums.PaymentModality.Cheque');
      });
    });

    describe('detail_title', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('detail_title').text()).toEqual('Children\'s Needs > Children\'s Supplies');
      });
    });

    describe('detail_item', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('detail_item').text()).toEqual('Children\'s Needs');
      });
    });

    describe('detail_subitem', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('detail_subitem').text()).toEqual('Children\'s Supplies');
      });
    });

    describe('doc_required', () => {
      it('shows depending on subItem.documentationRequired', async () => {
        const subItem = mockSubItemData();
        subItem.documentationRequired = true;
        await mountWrapper(false, 6, null, {
          computed: {
            subItem() {
              return subItem;
            },
          },
        });
        expect(wrapper.findDataTest('doc_required').exists()).toBeTruthy();

        subItem.documentationRequired = false;
        await mountWrapper(false, 6, null, {
          computed: {
            subItem() {
              return subItem;
            },
          },
        });
        expect(wrapper.findDataTest('doc_required').exists()).toBeFalsy();
      });
    });

    describe('eTransfer-email', () => {
      it('shows if payment modality is ETransfer', async () => {
        const paymentGroup = mockCaseFinancialAssistanceEntity().groups[0];
        paymentGroup.groupingInformation.modality = EPaymentModalities.ETransfer;
        await mountWrapper(false, 6, null, {
          computed: {
            paymentGroup() {
              return paymentGroup;
            },
          },
        });
        expect(wrapper.findDataTest('eTransfer-email').exists()).toBeTruthy();
      });
    });

    describe('related_number', () => {
      it('shows depending on modality', async () => {
        expect(wrapper.findDataTest('related_number').exists()).toBeFalsy();
        const paymentGroup = mockCaseFinancialAssistanceEntity().groups[0];
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        await mountWrapper(false, 6, null, {
          computed: {
            paymentGroup() {
              return paymentGroup;
            },
          },
        });
        expect(wrapper.findDataTest('related_number').exists()).toBeTruthy();
      });
    });

    describe('payeeSection', () => {
      it('shows depending on modality', async () => {
        expect(wrapper.findDataTest('payeeSection').exists()).toBeTruthy();
        const paymentGroup = mockCaseFinancialAssistanceEntity().groups[0];
        paymentGroup.groupingInformation.modality = EPaymentModalities.Invoice;
        await mountWrapper(false, 6, null, {
          computed: {
            paymentGroup() {
              return paymentGroup;
            },
          },
        });
        expect(wrapper.findDataTest('payeeSection').exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('financialAssistance', () => {
      it('calls the store', async () => {
        await mountWrapper();
        expect(financialAssistancePaymentStore.getById).toHaveBeenCalledWith(financialAssistance.id);
        expect(wrapper.vm.financialAssistance).toEqual(mockCaseFinancialAssistanceEntity({ id: '1' }));
      });
    });

    describe('paymentGroup', () => {
      it('filters by id within financialassistance', async () => {
        const financialAssistance = mockCaseFinancialAssistanceEntity();
        const newGroup = mockCaseFinancialAssistancePaymentGroups()[0];
        newGroup.lines = [{ id: 'filter' }];
        financialAssistance.groups.push(newGroup);

        await mountWrapper(false, 6, null, {
          computed: {
            financialAssistance() {
              return financialAssistance;
            },
          },
        });
        expect(wrapper.vm.paymentGroup).toEqual(paymentGroup);

        await wrapper.setProps({ financialAssistancePaymentLineId: 'filter' });
        expect(wrapper.vm.paymentGroup).toEqual(newGroup);
      });
    });

    describe('paymentLine', () => {
      it('filters by id within financialassistance', async () => {
        const financialAssistance = mockCaseFinancialAssistanceEntity();
        const newGroup = mockCaseFinancialAssistancePaymentGroups()[0];
        newGroup.lines = [{ id: 'filter' }];
        financialAssistance.groups.push(newGroup);

        await mountWrapper(false, 6, null, {
          computed: {
            financialAssistance() {
              return financialAssistance;
            },
          },
        });
        expect(wrapper.vm.paymentLine).toEqual(line);

        await wrapper.setProps({ financialAssistancePaymentLineId: 'filter' });
        expect(wrapper.vm.paymentLine).toEqual(newGroup.lines[0]);
      });
    });

    describe('title', () => {
      it('returns item and subitem data', async () => {
        await mountWrapper();
        expect(wrapper.vm.title).toEqual('Children\'s Needs > Children\'s Supplies');
      });
    });

    describe('addressLines', () => {
      it('calls address helper and joins results', async () => {
        householdHelpers.getAddressLines = jest.fn(() => ['ab', 'c']);
        await mountWrapper();
        expect(wrapper.vm.addressLines).toEqual('ab, c');
      });
    });

    describe('showTooltip', () => {
      it('returns true if subitem has maximum < amount', async () => {
        const subItem = mockSubItemData();
        subItem.maximumAmount = line.amount - 1;
        await mountWrapper(false, 6, null, {
          computed: {
            subItem() {
              return subItem;
            },
          },
        });
        expect(wrapper.vm.showTooltip).toBeTruthy();

        subItem.maximumAmount = line.amount + 1;
        await mountWrapper(false, 6, null, {
          computed: {
            subItem() {
              return subItem;
            },
          },
        });
        expect(wrapper.vm.showTooltip).toBeFalsy();
      });
    });
  });

  describe('LifeCycle', () => {
    describe('created', () => {
      it('calls and loads from the storage', async () => {
        await mountWrapper(true);
        expect(financialAssistancePaymentStore.fetch).toHaveBeenCalledWith(financialAssistance.id);
        expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
        expect(financialAssistancePaymentStore.fetch).toHaveBeenCalledWith(financialAssistance.id);
        expect(financialAssistanceStore.fetch).toHaveBeenCalledWith(financialAssistance.financialAssistanceTableId);
        expect(programStore.fetch).toHaveBeenCalledWith({
          id: financialAssistanceStore.getById().programId,
          eventId: caseFileStore.getById().eventId,
        });
        expect(financialAssistanceStore.setFinancialAssistance).toHaveBeenLastCalledWith(
          { fa: financialAssistanceStore.getById(),
            categories: financialAssistancePaymentStore.getFinancialAssistanceCategories(),
            newProgram: programStore.fetch(),
            removeInactiveItems: false,
          },
        );
      });
    });
  });
});
