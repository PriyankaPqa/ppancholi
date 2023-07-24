import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '../base';
import { IPotentialDuplicateEntity, DuplicateReason, DuplicateStatus, IHouseholdDuplicateStatusHistory } from './potential-duplicate.types';

export class PotentialDuplicateEntity extends BaseEntity {
  householdIds: uuid[];

  duplicateReasons: DuplicateReason[];

  duplicateStatus: DuplicateStatus;

  duplicateStatusHistory: IHouseholdDuplicateStatusHistory[];

  memberFirstName?: string;

  memberLastName?: string;

  constructor(data?: IPotentialDuplicateEntity) {
    if (data) {
      super(data);
      this.householdIds = data.householdIds;
      this.duplicateReasons = data.duplicateReasons;
      this.duplicateStatusHistory = _cloneDeep(data.duplicateStatusHistory);
      this.memberFirstName = data.memberFirstName;
      this.memberLastName = data.memberLastName;
    } else {
      super();
      this.householdIds = [];
      this.duplicateReasons = [];
      this.duplicateStatusHistory = null;
      this.memberFirstName = null;
      this.memberLastName = null;
    }
  }
}
