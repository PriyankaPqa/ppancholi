import { IMultilingual } from '@/types';
import { BaseEntity } from '@libs/core-lib/entities/base';
import utils from '../utils';
import {
  EPaymentModalities,
  IEligibilityCriteria,
  IProgramEntity,
  IProgramEntityData,
} from './program.types';

export class ProgramEntity extends BaseEntity implements IProgramEntity {
  eventId: uuid;

  name: IMultilingual;

  description: IMultilingual;

  approvalRequired: boolean;

  eligibilityCriteria: IEligibilityCriteria;

  paymentModalities: EPaymentModalities[];

  constructor(data?: IProgramEntityData) {
    if (data) {
      super(data);
      this.eventId = data.eventId;
      this.name = utils.initMultilingualAttributes(data.name);
      this.description = utils.initMultilingualAttributes(data.description);
      this.approvalRequired = data.approvalRequired;
      this.eligibilityCriteria = {
        authenticated: data.eligibilityCriteria.authenticated,
        impacted: data.eligibilityCriteria.impacted,
        completedAssessments: data.eligibilityCriteria.completedAssessments,
      };
      this.paymentModalities = [...data.paymentModalities];
    } else {
      super();
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
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.description = utils.getFilledMultilingualField(this.description);
  }
}
