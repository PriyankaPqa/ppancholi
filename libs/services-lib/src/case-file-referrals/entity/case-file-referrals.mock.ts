import { mockCaseFileReferralEntities, mockCaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import { mockDomainBaseService } from '../../base';
import { ICaseFileReferralsServiceMock } from './case-file-referrals.types';

export const mockCaseFileReferralsService = (): ICaseFileReferralsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileReferralEntities()),
  createReferral: jest.fn(() => mockCaseFileReferralEntity()),
  updateReferral: jest.fn(() => mockCaseFileReferralEntity()),
});
