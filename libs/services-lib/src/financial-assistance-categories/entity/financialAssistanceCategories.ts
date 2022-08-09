import { IHttpClient } from '../../http-client';
import { IFinancialAssistanceCategoriesService } from './financialAssistanceCategories.types';
import { OptionItemBaseService } from '../../option-items-base/base';

const API_URL_SUFFIX = 'finance';
const CONTROLLER = 'financial-assistance-categories';

export class FinancialAssistanceCategoriesService extends OptionItemBaseService implements IFinancialAssistanceCategoriesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
