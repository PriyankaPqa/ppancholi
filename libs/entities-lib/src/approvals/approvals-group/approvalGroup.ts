import { BaseEntity } from '../../base';
import { IApprovalGroup, IApprovalGroupData, IApprovalGroupDTO } from './approvalGroup.types';

export class ApprovalGroup extends BaseEntity implements IApprovalGroup {
  roles: Array<uuid>;

  minimumAmount: number;

  maximumAmount: number;

  editMode: boolean; // for UI

  addMode: boolean; // for UI

  constructor(data?: IApprovalGroupData) {
    if (data) {
      super(data);
      this.roles = data.roles;
      this.minimumAmount = data.minimumAmount;
      this.maximumAmount = data.maximumAmount;
      this.editMode = data.editMode || false;
      this.addMode = data.addMode || false;
    } else {
      super();
      this.reset();
    }
  }

  public setMinimum(value: number) {
    this.minimumAmount = value;
  }

  public setMaximum(value: number) {
    this.maximumAmount = value;
  }

  public setAddMode(value: boolean) {
    this.addMode = value;
  }

  public setEditMode(value: boolean) {
    this.editMode = value;
  }

  public setRoles(roles: uuid[]) {
    this.roles = roles;
  }

  toDto(): IApprovalGroupDTO {
    return {
      roles: this.roles,
      minimum: this.minimumAmount,
      maximum: this.maximumAmount,
    };
  }

  private reset() {
    this.roles = [];
    this.minimumAmount = 0;
    this.maximumAmount = 0;
    this.addMode = true;
    this.editMode = false;
  }
}
