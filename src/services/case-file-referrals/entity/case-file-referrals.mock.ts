import { mockCaseFileReferralEntities, mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { ICaseFileReferralsServiceMock } from './case-file-referrals.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

export const mockCaseFileReferralsService = (): ICaseFileReferralsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileReferralEntities()),
  createReferral: jest.fn(() => mockCaseFileReferralEntity()),
  updateReferral: jest.fn(() => mockCaseFileReferralEntity()),
});
