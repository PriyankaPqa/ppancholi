import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockSubItemData } from '@/entities/financial-assistance';
import { mockCaseFinancialAssistanceEntity, mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';
import { mockStorage } from '@/store/storage';
import flushPromises from 'flush-promises';
import { EPaymentModalities } from '@/entities/program/program.types';
import householdHelpers from '@/ui/helpers/household';
import Component from '../ViewPaymentLineDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let financialAssistance = mockCaseFinancialAssistanceEntity();
let paymentGroup = financialAssistance.groups[0];
let line = paymentGroup.lines[0];

describe('ViewPaymentLineDetails.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    financialAssistance = mockCaseFinancialAssistanceEntity();
    paymentGroup = financialAssistance.groups[0];
    line = paymentGroup.lines[0];

    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        financialAssistancePaymentLineId: line.id,
        financialAssistancePaymentId: financialAssistance.id,
        id: 'cfid',
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
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
      it('calls storage', async () => {
        await mountWrapper();
        expect(wrapper.vm.$storage.financialAssistancePayment.getters.get).toHaveBeenCalledWith(financialAssistance.id);
        expect(wrapper.vm.financialAssistance).toEqual(financialAssistance);
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
        expect(storage.financialAssistancePayment.actions.fetch).toHaveBeenCalledWith(financialAssistance.id);
        expect(storage.financialAssistanceCategory.actions.fetchAll).toHaveBeenCalled();
        expect(storage.financialAssistancePayment.actions.fetch).toHaveBeenCalledWith(financialAssistance.id);
        expect(storage.financialAssistance.actions.fetch).toHaveBeenCalledWith(financialAssistance.financialAssistanceTableId);
        expect(storage.program.actions.fetch).toHaveBeenCalledWith({
          id: storage.financialAssistance.getters.get().entity.programId,
          eventId: storage.caseFile.getters.get().entity.eventId,
        });
        expect(storage.financialAssistance.mutations.setFinancialAssistance).toHaveBeenLastCalledWith(storage.financialAssistance.getters.get(),
          storage.financialAssistanceCategory.getters.getAll().map((c) => c.entity), storage.program.actions.fetch().entity, false);
      });
    });
  });
});
