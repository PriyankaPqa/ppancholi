import { ICaseFileReferralMetadata } from '@libs/entities-lib/case-file-referral';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface ICaseFileReferralsMetadataService extends IDomainBaseService<ICaseFileReferralMetadata, { id: uuid, caseFileId: uuid }> {}
