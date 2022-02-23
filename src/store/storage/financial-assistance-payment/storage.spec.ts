/**
 * @group storage
 */

/* eslint-disable */
import { FINANCIAL_ASSISTANCE_PAYMENT_METADATA, FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { FinancialAssistancePaymentStorage } from './storage';
import { mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';

const entityModuleName = FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES;
const metadataModuleName = FINANCIAL_ASSISTANCE_PAYMENT_METADATA;

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
      },
    },
    [metadataModuleName]: {
      state: {
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new FinancialAssistancePaymentStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Financial Assistance Payment Storage', () => {
  describe('>> Actions', () => {
    it('should proxy addFinancialAssistancePayment', () => {
      const payload = mockCaseFinancialAssistanceEntity();
      storage.actions.addFinancialAssistancePayment(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/addFinancialAssistancePayment`, payload);
    });

    it('should proxy editFinancialAssistancePayment', () => {
      const payload = mockCaseFinancialAssistanceEntity();
      storage.actions.editFinancialAssistancePayment(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editFinancialAssistancePayment`, payload);
    });

    it('should proxy updatePaymentStatus', () => {
      const payload = mockCaseFinancialAssistanceEntity().id;
      storage.actions.updatePaymentStatus('myId', 'group-id', 2);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updatePaymentStatus`, { paymentGroupId: 'group-id', entityId: 'myId', status: 2 });
    });

    it('should proxy submitFinancialAssistancePayment', () => {
      const payload = mockCaseFinancialAssistanceEntity().id;
      storage.actions.submitFinancialAssistancePayment(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/submitFinancialAssistancePayment`, payload);
    });

    it('should proxy addFinancialAssistancePaymentLine', () => {
      const payload = mockCaseFinancialAssistanceEntity().groups[0];
      storage.actions.addFinancialAssistancePaymentLine('myId', payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/addFinancialAssistancePaymentLine`, { entity: payload, financialAssistanceId: 'myId' });
    });

    it('should proxy editFinancialAssistancePaymentLine', () => {
      const payload = mockCaseFinancialAssistanceEntity().groups[0];
      storage.actions.editFinancialAssistancePaymentLine('myId', payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editFinancialAssistancePaymentLine`, { entity: payload, financialAssistanceId: 'myId' });
    });

    it('should proxy deleteFinancialAssistancePaymentLine', () => {
      storage.actions.deleteFinancialAssistancePaymentLine('myId', 'payId');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/deleteFinancialAssistancePaymentLine`, { paymentId: 'payId', financialAssistanceId: 'myId' });
    });

    it('should proxy fetchHistory', () => {
      storage.actions.fetchHistory('myId', true);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchHistory`, { financialAssistanceId: 'myId', includeMetadata: true });
    });
  });
});
