import { ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICaseFileReferralsService extends IDomainBaseService<ICaseFileReferralEntity, { id: uuid, caseFileId: uuid }>{
  createReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
  updateReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity>;
}

export interface ICaseFileReferralsServiceMock extends IDomainBaseServiceMock<ICaseFileReferralEntity>{
  createReferral: jest.Mock<ICaseFileReferralEntity>;
  updateReferral: jest.Mock<ICaseFileReferralEntity>;
}
