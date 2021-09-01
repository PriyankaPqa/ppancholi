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

    it('should proxy updateReferral', () => {
      const payload = mockCaseFinancialAssistanceEntity();
      storage.actions.editFinancialAssistancePayment(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editFinancialAssistancePayment`, payload);
    });
  });
});
