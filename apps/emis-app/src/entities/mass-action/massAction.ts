import { BaseEntity } from '@libs/core-lib/entities/base';
import {
  IMassActionDetails, IMassActionEntity, IMassActionEntityData, IMassActionRun, MassActionGroup, MassActionType,
} from '@/entities/mass-action/massActions.types';

export class MassActionEntity extends BaseEntity implements IMassActionEntity {
  name: string;

  description: string;

  details: IMassActionDetails;

  type: MassActionType;

  group: MassActionGroup;

  runs: Array<IMassActionRun>

  constructor(data?: IMassActionEntityData) {
    if (data) {
      super(data);
      this.name = data.name;
      this.description = data.description;
      this.details = data.details ? { ...data.details } : null;
      this.type = data.type;
      this.group = data.group;
      this.runs = data.runs ? [...data.runs] : [];
    } else {
      super();
      this.name = '';
      this.description = '';
      this.details = {};
      this.type = MassActionType.Unknown;
      this.group = MassActionGroup.Unknown;
      this.runs = [];
    }
  }

  // Need to check if we want to implement it
  validate() {
    return true;
  }
}
