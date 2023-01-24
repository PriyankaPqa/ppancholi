import { mockApprovalTableData } from '@libs/entities-lib/approvals/approvals-table';

export function getMockExtensionComponents() {
  return {
    createApprovalTable: jest.fn(() => mockApprovalTableData()),
    editApprovalTable: jest.fn(() => mockApprovalTableData()),
    addGroup: jest.fn(() => mockApprovalTableData()),
    editGroup: jest.fn(() => mockApprovalTableData()),
    removeGroup: jest.fn(() => mockApprovalTableData()),
  };
}
