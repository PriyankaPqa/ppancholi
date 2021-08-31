/* eslint-disable */
import { FINANCIAL_ASSISTANCE_PAYMENT_METADATA, FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
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
  describe('>> Getters', () => {
    it('todo once we have stuff...', () => {
    });
  });

  describe('>> Actions', () => {
    it('todo once we have stuff...', () => {
      // storage.actions.fetchCategories();
      // expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCategories`);
    });
  });
});
