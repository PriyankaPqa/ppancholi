import { IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IApprovalTablesMetadataService } from './approvals.types';

const apiUrlSuffix = 'finance';
const controller = 'approval-tables/metadata';

export class ApprovalTablesMetadataService extends DomainBaseService<IApprovalTableMetadata, uuid> implements IApprovalTablesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
