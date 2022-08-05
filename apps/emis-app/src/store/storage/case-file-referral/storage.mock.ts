import {
  ICaseFileReferralCombined, ICaseFileReferralEntity, mockCaseFileReferralEntity, mockCombinedCaseFileReferrals,
} from '@libs/entities-lib/case-file-referral';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

import { BaseMock } from '../base/base.mock';

export class CaseFileReferralStorageMock extends BaseMock<ICaseFileReferralCombined, ICaseFileReferralEntity> {
  constructor() {
    super(mockCombinedCaseFileReferrals(), mockCaseFileReferralEntity());
  }

  protected getters = {
    ...this.baseGetters,
    types: jest.fn(),
    outcomeStatuses: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,
    fetchTypes: jest.fn(() => mockOptionItemData()),
    fetchOutcomeStatuses: jest.fn(() => mockOptionItemData()),
    createReferral: jest.fn((payload: ICaseFileReferralEntity) => payload),
    updateReferral: jest.fn((payload: ICaseFileReferralEntity) => payload),
  }

  protected mutations = {
    ...this.baseMutations,
    setTypesFetched: jest.fn(),
    setOutcomeStatusesFetched: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
