import { ICaseFileReferralMetadata } from '@libs/entities-lib/case-file-referral';
import { IDomainBaseService } from '../../base';

export interface ICaseFileReferralsMetadataService extends IDomainBaseService<ICaseFileReferralMetadata, { id: uuid, caseFileId: uuid }> {}
