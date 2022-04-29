import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { IDomainBaseService, IDomainBaseServiceMock } from '@libs/core-lib/services/base';

export interface ICaseFileReferralsService extends IDomainBaseService<ICaseFileReferralEntity, { id: uuid, caseFileId: uuid }>{
  createReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
  updateReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
}

export interface ICaseFileReferralsServiceMock extends IDomainBaseServiceMock<ICaseFileReferralEntity>{
  createReferral: jest.Mock<ICaseFileReferralEntity>;
  updateReferral: jest.Mock<ICaseFileReferralEntity>;
}
