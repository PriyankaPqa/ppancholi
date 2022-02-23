import { IFinancialAssistanceCategoriesServiceMock } from './financialAssistanceCategories.types';
import { mockOptionItemData } from '../../../entities/optionItem/optionItem.mock';
import { mockOptionItemDomainBaseService } from '../../option-items-base/base.mock';

export const mockFinancialAssistanceCategoriesService = (): IFinancialAssistanceCategoriesServiceMock => ({
  ...mockOptionItemDomainBaseService(mockOptionItemData()),
});
