import { IMultilingual } from '@/types';
import { EProgramStatus } from '../program';
import {
  EFinancialAssistanceStatus,
  IFinancialAssistanceTable,
  IFinancialAssistanceTableRowData,
  IFinancialAssistanceTableData,
} from './financial-assistance.types';

export class FinancialAssistanceTable implements IFinancialAssistanceTable {
  id?: uuid;

  name: IMultilingual;

  eventId: uuid;

  status?: EFinancialAssistanceStatus;

  programId: uuid;

  programName?: IMultilingual;

  programStatus?: EProgramStatus;

  programEventId?: uuid;

  rows: Array<IFinancialAssistanceTableRowData>;

  constructor(data?: IFinancialAssistanceTableData) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.eventId = data.eventId;
      this.status = data.status;
      this.programId = data.programId;
      this.rows = data.rows;
    } else {
      this.reset();
    }
  }

  private reset() {
    // todo
  }
}
