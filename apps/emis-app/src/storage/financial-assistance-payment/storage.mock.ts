import {
  IFinancialAssistancePaymentCombined,
  IFinancialAssistancePaymentEntity,
  mockCaseFinancialAssistanceEntity,
  mockCombinedCaseFinancialAssistance,
} from '@libs/entities-lib/financial-assistance-payment';

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
    editFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    updatePaymentStatus: jest.fn(() => this.baseGetters.get().entity),
    submitFinancialAssistancePayment: jest.fn(() => this.baseGetters.get().entity),
    submitApprovalRequest: jest.fn(() => this.baseGetters.get().entity),
    submitApprovalAction: jest.fn(() => this.baseGetters.get().entity),
    addFinancialAssistancePaymentLine:
      jest.fn(() => this.baseGetters.get().entity),
    editFinancialAssistancePaymentLine:
      jest.fn(() => this.baseGetters.get().entity),
    deleteFinancialAssistancePaymentLine:
      jest.fn(() => this.baseGetters.get().entity),
    fetchHistory:
      jest.fn(() => []),
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
