import { mockApprovalTableMetadatum } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalTablesMetadataServiceMock } from './approvals.types';
import { mockDomainBaseService } from '../../base';

export const mockApprovalTablesMetadataService = (): IApprovalTablesMetadataServiceMock => ({
  ...mockDomainBaseService(mockApprovalTableMetadatum()),
});
