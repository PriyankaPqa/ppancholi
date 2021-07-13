import {
  ICaseFileReferralCombined, ICaseFileReferralEntity, mockCaseFileReferralEntity, mockCombinedCaseFileReferrals,
} from '@/entities/case-file-referral';
import { mockOptionItemData } from '@/entities/optionItem';

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
