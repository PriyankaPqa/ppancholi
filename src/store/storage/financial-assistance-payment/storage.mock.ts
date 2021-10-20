/* eslint-disable */
import {
  IFinancialAssistancePaymentCombined,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  mockCaseFinancialAssistanceEntity,
  mockCombinedCaseFinancialAssistance,
  PaymentStatus,
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
    editFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    updatePaymentStatus: jest.fn((payload: { paymentGroupId: uuid, entityId: uuid, status: PaymentStatus }) => this.baseGetters.get().entity),
    submitFinancialAssistancePayment: jest.fn((payload: uuid) => this.baseGetters.get().entity),
    addFinancialAssistancePaymentLine:
      jest.fn((financialAssistanceId: uuid, payload: IFinancialAssistancePaymentGroup) => this.baseGetters.get().entity),
    editFinancialAssistancePaymentLine:
      jest.fn((financialAssistanceId: uuid, payload: IFinancialAssistancePaymentGroup) => this.baseGetters.get().entity),
    deleteFinancialAssistancePaymentLine:
      jest.fn((financialAssistanceId: uuid, payload: uuid) => this.baseGetters.get().entity),
    fetchHistory:
      jest.fn((financialAssistanceId: uuid, includeMetadata: boolean) => []),
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
