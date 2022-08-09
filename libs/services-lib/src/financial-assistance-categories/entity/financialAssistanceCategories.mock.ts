import { mockOptionItemData } from '@libs/entities-lib/optionItem/optionItem.mock';
import { IFinancialAssistanceCategoriesServiceMock } from './financialAssistanceCategories.types';
import { mockOptionItemDomainBaseService } from '../../option-items-base/base.mock';

export const mockFinancialAssistanceCategoriesService = (): IFinancialAssistanceCategoriesServiceMock => ({
  ...mockOptionItemDomainBaseService(mockOptionItemData()),
});
