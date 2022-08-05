import { IFinancialAssistanceCategoriesServiceMock } from './financialAssistanceCategories.types';
import { mockOptionItemData } from '../../../../../../libs/entities-lib/src/optionItem/optionItem.mock';
import { mockOptionItemDomainBaseService } from '../../option-items-base/base.mock';

export const mockFinancialAssistanceCategoriesService = (): IFinancialAssistanceCategoriesServiceMock => ({
  ...mockOptionItemDomainBaseService(mockOptionItemData()),
});
