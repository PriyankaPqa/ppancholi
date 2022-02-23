import { ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { IDomainBaseService } from '@/services/base';

export interface ICaseFileReferralsMetadataService extends IDomainBaseService<ICaseFileReferralMetadata, { id: uuid, caseFileId: uuid }> {}
