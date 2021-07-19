import { IMultilingual } from '@/types';
import { BaseEntity, Status } from '@crctech/registration-lib/src/entities/base';
import utils from '@/entities/utils';
import { EProgramStatus } from '../program';
import { IFinancialAssistanceTableEntity, IFinancialAssistanceTableRowData } from './financial-assistance.types';

export class FinancialAssistanceTableEntity extends BaseEntity implements IFinancialAssistanceTableEntity {
  name: IMultilingual;

  eventId: uuid;

  programId: uuid;

  programName?: IMultilingual;

  programStatus?: EProgramStatus;

  programEventId?: uuid;

  rows: Array<IFinancialAssistanceTableRowData>;

  constructor(data?: IFinancialAssistanceTableEntity) {
    if (data) {
      super(data);
      this.id = data.id;
      this.name = data.name;
      this.eventId = data.eventId;
      this.status = data.status;
      this.programId = data.programId;
      this.rows = data.rows;
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
    this.rows = [];
  }
}
