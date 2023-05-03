import { IAddNewPaymentLineFields } from 'cypress/pages/financial-assistance-payment/addNewPaymentLine.page';
import { mockFinancialAssistanceTableSubItemData } from '@libs/cypress-lib/mocks/financialAssistanceTables/financialAssistanceTables';
import { ICaseNotesData } from '../pages/casefiles/caseNotes.page';

export const fixtureCaseNotes = (retries: number): ICaseNotesData => ({
  subject: `Case Notes - retries${retries}`,
  category: ' Action log ',
  description: 'Case Notes Description En',
});

export const fixturePaymentLine = (): IAddNewPaymentLineFields => ({
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentModality: 'Prepaid Card',
  amount: `${mockFinancialAssistanceTableSubItemData().maximumAmount}.00`,
  relatedNumber: '11001',
});
