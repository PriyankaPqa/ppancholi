import { IApprovalTableCombined, IApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';
import { mockApprovalTableData, mockApprovalTableEntity, mockCombinedApprovalsTables } from '@libs/entities-lib/approvals/approvals-table/approvalTable.mock';
import { BaseMock } from '../base/base.mock';

export class ApprovalTableStorageMock extends BaseMock<IApprovalTableCombined, IApprovalTableEntity> {
  constructor() {
    super(mockCombinedApprovalsTables(), mockApprovalTableEntity());
  }

  protected getters = {
    ...this.baseGetters,
  }

  protected actions = {
    ...this.baseActions,
    createApprovalTable: jest.fn(() => mockApprovalTableData()),
  }

  protected mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
