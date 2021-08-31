/* eslint-disable */
import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { FinancialAssistancePaymentsService } from '@/services/financial-assistance-payments/entity';

import { IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';
import { FinancialAssistancePaymentEntityModule } from './financialAssistancePaymentEntity';
import { IFinancialAssistancePaymentEntityState } from './financialAssistancePaymentEntity.types';

const service = new FinancialAssistancePaymentsService(httpClient);
let module: FinancialAssistancePaymentEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IFinancialAssistancePaymentEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IFinancialAssistancePaymentEntityState, IFinancialAssistancePaymentEntityState>;

describe('Financial assistance payment entity module', () => {
  
  beforeEach(() => {
    module = new FinancialAssistancePaymentEntityModule(service);
  });
  
  describe('getters', () => {
    describe('to do once we have specific stuff...', () => {
      test('to do', () => {
        // module.mutations.setCategories(module.state, mockOptionItemData());
        // const res = module.getters.categories(module.state)(false);
        // expect(res).toEqual(
        //   _sortBy(
        //     mockOptionItemData().map((e) => new OptionItem(e)),
        //     'orderRank',
        //   ),
        // );
      });
    });
  });
});
