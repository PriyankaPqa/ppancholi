/**
 * @group ui/components/case-file
 */

import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockProvider } from '@/services/provider';
import Component from '../StatisticsDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const services = mockProvider();

describe('StatisticsDialog.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        caseFileId: 'abcd',
        show: true,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
        $services: services,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    describe('paymentModalityCounts_section', () => {
      it('shows details per paymentModalityCounts', async () => {
        await mountWrapper();
        const sheets = wrapper.findDataTest('paymentModalityCounts_section').findAll('v-sheet-stub').wrappers;
        expect(sheets.length).toEqual(wrapper.vm.summary.paymentModalityCounts.length);
        expect(sheets[0].text()).toContain('enums.PaymentModality.Cheque');
        expect(sheets[0].text()).toContain('1');
        expect(sheets[1].text()).toContain('enums.PaymentModality.DirectDeposit');
        expect(sheets[1].text()).toContain('2');
        expect(sheets[2].text()).toContain('enums.PaymentModality.ETransfer');
        expect(sheets[2].text()).toContain('1');
      });
    });

    describe('totals_section', () => {
      it('shows the totals', async () => {
        await mountWrapper();
        const sheets = wrapper.findDataTest('totals_section').findAll('v-sheet-stub').wrappers;
        expect(sheets.length).toEqual(4);
        expect(sheets[0].text()).toContain('caseFile.financialAssistance.statistics.unapproved');
        expect(sheets[0].text()).toContain('$333.43');
        expect(sheets[1].text()).toContain('caseFile.financialAssistance.statistics.committed');
        expect(sheets[1].text()).toContain('$121.56');
        expect(sheets[2].text()).toContain('caseFile.financialAssistance.statistics.completed');
        expect(sheets[2].text()).toContain('$233.43');
        expect(sheets[3].text()).toContain('caseFile.financialAssistance.statistics.grandTotal');
        expect(sheets[3].text()).toContain('$876.43');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls service to fetch summary', async () => {
        await mountWrapper();
        expect(services.financialAssistancePaymentsService.getPaymentSummary).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.summary).toEqual(services.financialAssistancePaymentsService.getPaymentSummary());
      });
    });
  });
});
