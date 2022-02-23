import { IMultilingual } from '@/types';
import utils from '@/entities/utils';
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

  constructor(data?: IFinancialAssistanceTableEntity) {
    if (data) {
      super(data);
      this.id = data.id;
      this.name = data.name;
      this.eventId = data.eventId;
      this.status = data.status;
      this.programId = data.programId;
      this.items = data.items;
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
    this.items = [];
  }
}
