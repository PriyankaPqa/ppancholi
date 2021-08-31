import {
  IFinancialAssistancePaymentCombined, IFinancialAssistancePaymentEntity, mockCaseFinancialAssistanceEntity, mockCombinedCaseFinancialAssistance,
} from '@/entities/financial-assistance-payment';

import { BaseMock } from '../base/base.mock';

export class FinancialAssistancePaymentStorageMock extends BaseMock<IFinancialAssistancePaymentCombined, IFinancialAssistancePaymentEntity> {
  constructor() {
    super([mockCombinedCaseFinancialAssistance()], mockCaseFinancialAssistanceEntity());
  }

  protected getters = {
    ...this.baseGetters,
  }

  protected actions = {
    ...this.baseActions,
    addFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
  }

  protected mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
