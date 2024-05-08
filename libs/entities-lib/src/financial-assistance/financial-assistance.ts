import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '../utils';
import { BaseEntity, Status } from '../base';
import { IFinancialAssistanceTableEntity, IFinancialAssistanceTableItemData } from './financial-assistance.types';

export class FinancialAssistanceTableEntity extends BaseEntity implements IFinancialAssistanceTableEntity {
  name: IMultilingual;

  eventId: uuid;

  programId: uuid;

  programName?: IMultilingual;

  programStatus?: Status;

  programEventId?: uuid;

  items: Array<IFinancialAssistanceTableItemData>;

  useForLodging: boolean;

  constructor(data?: IFinancialAssistanceTableEntity) {
    if (data) {
      super(data);
      this.id = data.id;
      this.name = utils.initMultilingualAttributes(data.name);
      this.eventId = data.eventId;
      this.status = data.status;
      this.programId = data.programId;
      this.useForLodging = data.useForLodging;
      this.items = _cloneDeep(data.items) || [];
    } else {
      super();
      this.reset();
    }
  }

  private reset() {
    this.id = '';
    this.name = utils.initMultilingualAttributes();
    this.eventId = '';
    this.status = Status.Active;
    this.programId = '';
    this.useForLodging = false;
    this.items = [];
  }
}
