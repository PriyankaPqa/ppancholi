import { AddFinancialAssistancePage } from 'cypress/pages/financial-assistance-payment/addFinancialAssistance.page';

  export const verifyAndReturnAddFaPaymentPage = (): AddFinancialAssistancePage | null => {
    cy.getByDataTest({ selector: 'page-title', type: 'h1' }).contains('Add financial assistance').should('be.visible');
    return new AddFinancialAssistancePage();
  };
