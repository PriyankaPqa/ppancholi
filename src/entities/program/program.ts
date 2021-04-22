import { IMultilingual } from '@/types';
import utils from '../utils';
import {
  EPaymentModalities,
  EProgramStatus,
  IEligibilityCriteria,
  IProgram,
  IProgramSearchData,
} from './program.types';

export class Program implements IProgram {
  id: uuid;

  created: Date | string;

  eventId: uuid;

  name: IMultilingual;

  description: IMultilingual;

  approvalRequired: boolean;

  eligibilityCriteria: IEligibilityCriteria;

  programStatus: EProgramStatus;

  paymentModalities: EPaymentModalities[];

  constructor(data?: IProgramSearchData) {
    if (data) {
      this.id = data.programId;
      this.created = data.createdDate;
      this.eventId = data.eventId;
      this.name = utils.initMultilingualAttributes(data.programName);
      this.description = utils.initMultilingualAttributes(data.programDescription);
      this.approvalRequired = data.approvalRequired;
      this.eligibilityCriteria = {
        authenticated: data.eligibilityCriteria.authenticated,
        impacted: data.eligibilityCriteria.impacted,
        completedAssessments: data.eligibilityCriteria.completedAssessments,
      };
      this.programStatus = data.programStatus;
      this.paymentModalities = [...data.paymentModalities];
    } else {
      this.reset();
    }
  }

  private reset() {
    this.id = null;
    this.created = null;
    this.eventId = null;
    this.name = utils.initMultilingualAttributes();
    this.description = utils.initMultilingualAttributes();
    this.approvalRequired = true;
    this.eligibilityCriteria = {
      authenticated: false,
      completedAssessments: false,
      impacted: false,
    };
    this.programStatus = EProgramStatus.Inactive;
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.description = utils.getFilledMultilingualField(this.description);
  }
}
