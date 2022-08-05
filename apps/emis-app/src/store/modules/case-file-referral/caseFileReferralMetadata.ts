import { BaseModule } from '@/store/modules/base';
import { ICaseFileReferralMetadata } from '@libs/entities-lib/case-file-referral';

export class CaseFileReferralMetadataModule extends BaseModule<ICaseFileReferralMetadata, { id: uuid, caseFileId: uuid }> {}
