import { ICaseFileReferralEntity } from '@/entities/case-file-referral';

export interface ICaseFileReferralsService {
  createReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
  updateReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
}

export interface ICaseFileReferralsServiceMock {
  createReferral: jest.Mock<ICaseFileReferralEntity>;
  updateReferral: jest.Mock<ICaseFileReferralEntity>;
}
