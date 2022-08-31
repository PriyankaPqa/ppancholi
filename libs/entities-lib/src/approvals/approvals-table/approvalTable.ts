import { ApprovalBaseEntity } from '../approvals-base';
import { IApprovalTableEntity, IApprovalTableEntityData } from './approvalTable.types';

export class ApprovalTableEntity extends ApprovalBaseEntity implements IApprovalTableEntity {
  eventId: uuid;

  programId: uuid;

  constructor(data?: IApprovalTableEntityData) {
    if (data) {
      super(data);
      this.eventId = data.eventId;
      this.programId = data.programId;
    } else {
      super();
      this.localReset();
    }
  }

  public setProgramId(id: uuid) {
    this.programId = id;
  }

  private localReset() {
    this.eventId = '';
    this.programId = '';
  }
}
