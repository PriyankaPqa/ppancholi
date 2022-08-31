import { BaseModule } from '@/store/modules/base';
import { IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';

export class ApprovalTableMetadataModule extends BaseModule<IApprovalTableMetadata, uuid> {}
