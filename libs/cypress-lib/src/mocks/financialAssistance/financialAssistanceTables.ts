import {
  ICreateFinancialAssistanceTableRequest,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItemData,
  EFinancialAmountModes,
  EFinancialFrequency,
} from '@libs/entities-lib/financial-assistance';
import { mockBaseData, Status } from '@libs/entities-lib/base';

export const mockFinancialAssistanceTableSubItemData = (force?: Partial<IFinancialAssistanceTableSubItemData>) : IFinancialAssistanceTableSubItemData => ({
  subCategory: {
    optionItemId: '39443fea-7010-4e63-9d13-280db61a9715',
    specifiedOther: null,
  },
  maximumAmount: 80,
  amountType: EFinancialAmountModes.Fixed,
  documentationRequired: false,
  frequency: EFinancialFrequency.Multiple,
  ...force,
});

export const mockFinancialAssistanceTableItemData = (force?: Partial<IFinancialAssistanceTableItemData>) : IFinancialAssistanceTableItemData => ({
  mainCategory: {
    optionItemId: 'ade08607-c1c8-4efe-8608-a5ad6e8d676f',
    specifiedOther: null,
  },
  subItems: [mockFinancialAssistanceTableSubItemData()],
  ...force,
});

export const mockCreateFinancialAssistanceTableRequest = (force?: Partial<ICreateFinancialAssistanceTableRequest>) : ICreateFinancialAssistanceTableRequest => ({
  ...mockBaseData(),
  eventId: 'd3becde1-6ec7-4b59-85c0-6e7fa3511e2e',
  programId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  name: {
    translation: {
      en: 'FA - Table - En',
      fr: 'FA - Table - Fr',
    },
  },
  status: Status.Active,
  items: [mockFinancialAssistanceTableItemData()],
  ...force,
});
