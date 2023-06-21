import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { IAddNewPaymentLineFields } from '../../../pages/financial-assistance-payment/addNewPaymentLine.page';

export interface PaymentLineCanStepsParams {
  faTable: IFinancialAssistanceTableEntity,
  retries: number,
  paymentLineData: IAddNewPaymentLineFields,
  groupTitle: string,
  }

export const paymentLineCanSteps = ({ faTable, retries, paymentLineData, groupTitle }: PaymentLineCanStepsParams) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.selectTable(faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description ${groupTitle} Payment Line - retries - ${retries}`);

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(paymentLineData);
  addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
  addNewPaymentLinePage.fillRelatedNumber(paymentLineData.relatedNumber);
  addNewPaymentLinePage.fillAmount(paymentLineData.amount);
  addNewPaymentLinePage.addNewPaymentLine();

  addFinancialAssistancePage.getSectionTitleElement().contains('Payment line(s)').should('be.visible');
  addFinancialAssistancePage.getPaymentLineGroupTitle().should('eq', groupTitle);
  addFinancialAssistancePage.getItemEditButton().should('be.visible');
  addFinancialAssistancePage.getItemDeleteButton().should('be.visible');
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('not.be.enabled');
  addFinancialAssistancePage.getCreateButton().click();

  cy.contains('The financial assistance has been successfully created').should('be.visible');
  addFinancialAssistancePage.getPaymentStatus().should('eq', 'New');
  addFinancialAssistancePage.getPaymentLineGroupStatus().should('eq', 'Payment must be submitted');
  addFinancialAssistancePage.getPaymentEditButton().should('be.visible');
  addFinancialAssistancePage.getPaymentDeleteButton().should('be.visible');
  addFinancialAssistancePage.getPaymentLineItemTitle().should('eq', `${paymentLineData.item} > ${paymentLineData.subItem}`);
  addFinancialAssistancePage.getRelatedNumber().should('string', paymentLineData.relatedNumber);
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
};
