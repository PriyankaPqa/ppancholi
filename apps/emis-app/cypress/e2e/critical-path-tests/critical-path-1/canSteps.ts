import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { ICreateHouseholdRequest } from '@libs/entities-lib/household-create';
import { AddFinancialAssistancePage } from '../../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { IAddNewPaymentLineFields } from '../../../pages/financial-assistance-payment/addNewPaymentLine.page';

export interface PaymentLineCanStepsParams {
  faTable: IFinancialAssistanceTableEntity,
  retries: number,
  paymentLineData: IAddNewPaymentLineFields,
  groupTitle: string,
  household: ICreateHouseholdRequest,
}

const addPaymentLineCanSteps = ({ faTable, retries, paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.selectTable(faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description ${groupTitle} Payment Line - retries - ${retries}`);

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(paymentLineData);
  addNewPaymentLinePage.getRelatedNumberField().should('be.visible');
  addNewPaymentLinePage.fillRelatedNumber(paymentLineData.relatedNumber);
  addNewPaymentLinePage.fillAmount(paymentLineData.amount);
  addNewPaymentLinePage.addNewPaymentLine();
};

const addPaymentLineChequeCanSteps = ({ faTable, retries, paymentLineData, household }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.disabled');
  addFinancialAssistancePage.getCreateButton().should('not.be.enabled');
  addFinancialAssistancePage.selectTable(faTable.name.translation.en);
  addFinancialAssistancePage.fillDescription(`Financial Description Cheque Payment Line - retries - ${retries}`);
  addFinancialAssistancePage.getAddPaymentLineButton().click();

  const addNewPaymentLinePage = addFinancialAssistancePage.addPaymentLine();
  addNewPaymentLinePage.fill(paymentLineData);
  addNewPaymentLinePage.getAmountValue().should('eq', paymentLineData.amount);
  // eslint-disable-next-line
  addNewPaymentLinePage.getPayeeNameValue().should('eq', `${household.primaryBeneficiary.identitySet.firstName} ${household.primaryBeneficiary.identitySet.lastName}`);
  addNewPaymentLinePage.getPayeeTypeElement().contains('Individual').should('be.visible');
  addNewPaymentLinePage.getStreetValue().should('eq', household.homeAddress.streetAddress);
  addNewPaymentLinePage.getUnitSuiteValue().should('eq', household.homeAddress.unitSuite);
  addNewPaymentLinePage.getCityValue().should('eq', household.homeAddress.city);
  addNewPaymentLinePage.getProvinceElement().contains('Alberta').should('be.visible');
  addNewPaymentLinePage.getPostalCodeValue().should('eq', household.homeAddress.postalCode);
  addNewPaymentLinePage.addNewPaymentLine();
};

const financialAssistanceCanSteps = ({ paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  const addFinancialAssistancePage = new AddFinancialAssistancePage();
  addFinancialAssistancePage.getSectionTitleElement().contains('Payment line(s)').should('be.visible');
  addFinancialAssistancePage.getPaymentLineGroupTitle().should('string', groupTitle);
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
  if (groupTitle !== 'Cheque') {
    addFinancialAssistancePage.getRelatedNumber().should('string', paymentLineData.relatedNumber);
  }
  addFinancialAssistancePage.getAddPaymentLineButton().should('be.enabled');
  addFinancialAssistancePage.getSubmitAssistanceButton().should('be.enabled');
  addFinancialAssistancePage.getBackToFinancialAssistanceButton().should('be.enabled');
};

export const paymentLineGeneralCanSteps = ({ faTable, retries, paymentLineData, groupTitle }: Partial<PaymentLineCanStepsParams>) => {
  addPaymentLineCanSteps({ faTable, retries, paymentLineData, groupTitle });
  financialAssistanceCanSteps({ paymentLineData, groupTitle });
};

export const paymentLineChequeCanSteps = ({ faTable, retries, paymentLineData, groupTitle, household }: Partial<PaymentLineCanStepsParams>) => {
  addPaymentLineChequeCanSteps({ faTable, retries, paymentLineData, household });
  financialAssistanceCanSteps({ paymentLineData, groupTitle });
};
