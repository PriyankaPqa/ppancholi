import { BaseStoreComponents } from '@libs/stores-lib/base';
import { ApprovalTablesService, IApprovalTablesServiceMock } from '@libs/services-lib/approval-tables/entity';
import { IApprovalTableEntity, IApprovalTableEntityData, IdParams } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IApprovalTableEntityData, IdParams>,
  service: ApprovalTablesService | IApprovalTablesServiceMock,
) {
  async function createApprovalTable(approvalTableEntity: IApprovalTableEntity): Promise<IApprovalTableEntityData> {
    const result = await service.create(approvalTableEntity);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function editApprovalTable(approvalTableEntity: IApprovalTableEntity): Promise<IApprovalTableEntityData> {
    const result = await service.edit(approvalTableEntity.id, approvalTableEntity);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function addGroup({ approvalId, group }: { approvalId: uuid, group: IApprovalGroup }): Promise<IApprovalTableEntityData> {
    const result = await service.addGroup(approvalId, group);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function removeGroup({ approvalId, groupId }: { approvalId: uuid, groupId: uuid }): Promise<IApprovalTableEntityData> {
    const result = await service.removeGroup(approvalId, groupId);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function editGroup({ approvalId, group }: { approvalId: uuid, group: IApprovalGroup }): Promise<IApprovalTableEntityData> {
    const result = await service.editGroup(approvalId, group);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    createApprovalTable,
    editApprovalTable,
    addGroup,
    removeGroup,
    editGroup,
  };
}
