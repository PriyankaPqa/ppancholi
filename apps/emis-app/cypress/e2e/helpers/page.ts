import { AddFinancialAssistancePage } from '../../pages/financial-assistance-payment/addFinancialAssistance.page';
import { CreateNewTeamPage } from '../../pages/teams/createNewTeam.page';

  export const verifyAndReturnAddFaPaymentPage = (): AddFinancialAssistancePage | null => {
    cy.getByDataTest({ selector: 'page-title', type: 'h1' }).contains('Add financial assistance').should('be.visible');
    return new AddFinancialAssistancePage();
  };

export const verifyAndReturnCreateNewTeamPage = (): CreateNewTeamPage | null => {
  cy.getByDataTest({ selector: 'page-title', type: 'h1' }).contains('Create new team').should('be.visible');
  return new CreateNewTeamPage();
};
