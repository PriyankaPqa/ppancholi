import { IMultilingual } from '@libs/shared-lib/src/types';
import utils from '../../utils';
import { BaseEntity, Status } from '../../base';
import { ApprovalAggregatedBy, IApprovalBaseEntity, IApprovalBaseEntityData } from './approval.types';
import { ApprovalGroup, IApprovalGroup } from '../approvals-group';

export class ApprovalBaseEntity extends BaseEntity implements IApprovalBaseEntity {
  name: IMultilingual;

  aggregatedByType: ApprovalAggregatedBy;

  groups: Array<IApprovalGroup>;

  approvalBaseStatus: Status;

  constructor(data?: IApprovalBaseEntityData) {
    if (data) {
      super(data);
      this.name = utils.initMultilingualAttributes(data.name);
      this.aggregatedByType = data.aggregatedByType;
      this.initApprovalGroups(data.groups);
      this.approvalBaseStatus = data.approvalBaseStatus;
    } else {
      super();
      this.reset();
    }
  }

  public setGroup(item: IApprovalGroup, index: number): IApprovalGroup {
    // Replace the item immutable way
    this.groups = [...this.groups.slice(0, index), new ApprovalGroup(item), ...this.groups.slice(index + 1)];
    return this.groups[index];
  }

  public addGroup(item: IApprovalGroup) {
    let newGroup = new ApprovalGroup(item);
    if (this.groups.length > 0) {
      newGroup = this.updatePriceOnCreation(newGroup);
    }
    this.groups.push(newGroup);
  }

  public deleteGroup(indexToRemove: number) {
    this.groups = this.groups.filter((_, i) => i !== indexToRemove);
    if (this.groups.length >= 2) {
      this.updatePriceOnDeletion();
    }
  }

  private updatePriceOnCreation(newGroup: ApprovalGroup) {
    const previousGroupMaximumAmount = this.groups[this.groups.length - 1].maximumAmount;
    newGroup.minimumAmount = Number((previousGroupMaximumAmount + 0.01).toFixed(2));
    return newGroup;
  }

  private updatePriceOnDeletion() {
    for (let i = 1; i < this.groups.length; i += 1) {
      const lastGroup = this.groups[this.groups.length - i];
      const beforeLastGroup = this.groups[this.groups.length - i - 1];
      lastGroup.minimumAmount = Number((beforeLastGroup.maximumAmount + 0.01).toFixed(2));
    }
  }

  private reset() {
    this.name = utils.initMultilingualAttributes();
    this.aggregatedByType = null;
    this.groups = [];
    this.approvalBaseStatus = Status.Active;
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
  }

  private initApprovalGroups(groups: Array<IApprovalGroup>) {
    this.groups = [];
    if (groups) {
      groups.forEach((g) => {
        this.groups.push(new ApprovalGroup(g));
      });
    }
  }
}
