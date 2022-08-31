import { IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IApprovalTablesMetadataService extends IDomainBaseService<IApprovalTableMetadata, uuid> {}

export interface IApprovalTablesMetadataServiceMock extends IDomainBaseServiceMock<IApprovalTableMetadata> {

}
