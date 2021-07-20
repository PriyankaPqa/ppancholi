import { mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { ICaseFileReferralsServiceMock } from './case-file-referrals.types';

export const mockCaseFileReferralsService = (): ICaseFileReferralsServiceMock => ({
  createReferral: jest.fn(() => mockCaseFileReferralEntity()),
  updateReferral: jest.fn(() => mockCaseFileReferralEntity()),
});
