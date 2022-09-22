import { mockApprovalTableData, mockApprovalTableEntities, mockApprovalTablesData } from '@libs/entities-lib/approvals/approvals-table';
import { mockDomainBaseService } from '../../base';
import { IApprovalTablesServiceMock } from './approvalTables.types';

export const mockApprovalTablesService = (): IApprovalTablesServiceMock => ({
  ...mockDomainBaseService(mockApprovalTableEntities()),
  create: jest.fn(() => mockApprovalTableData()),
  getApprovalsTableByEventId: jest.fn(() => mockApprovalTablesData()),
  edit: jest.fn(() => mockApprovalTableData()),
  addGroup: jest.fn(() => mockApprovalTableData()),
  removeGroup: jest.fn(() => mockApprovalTableData()),
  editGroup: jest.fn(() => mockApprovalTableData()),
});
