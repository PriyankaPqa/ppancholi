import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { prepareStateEventTeamProgramTableWithItemSubItem, prepareStateHouseholdAddSubmitUpdateFAPayment } from '../../helpers/prepareState';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { updatePaymentGroupStatusTo } from './canSteps';

const canRoles = {
  Level6: UserRoles.level6,
  Contributor2: UserRoles.contributor2,
};

const cannotRoles = {
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor3: UserRoles.contributor3,
  Contributor1: UserRoles.contributor1,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';

describe('#TC266# - Update Direct Deposit payment group status - L6 and C2', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEventTeamProgramTable = await prepareStateEventTeamProgramTableWithItemSubItem(accessTokenL6, allRolesValues, EFinancialAmountModes.Fixed);
      cy.wrap(resultPrepareStateEventTeamProgramTable.event).as('event');
      cy.wrap(resultPrepareStateEventTeamProgramTable.table).as('table');
      cy.wrap(resultPrepareStateEventTeamProgramTable.provider).as('provider');
      cy.wrap(resultPrepareStateEventTeamProgramTable.team).as('teamCreated');
    });
  });
  after(function () {
    if (this.teamCreated?.id && this.provider) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            // eslint-disable-next-line
            const resultPrepareStateHouseholdFAPayment = await prepareStateHouseholdAddSubmitUpdateFAPayment(accessTokenL6, this.event, this.table.id, PaymentStatus.Cancelled, EPaymentModalities.DirectDeposit);
            cy.wrap(resultPrepareStateHouseholdFAPayment.submittedFinancialAssistancePayment.id).as('FAPaymentId');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultPrepareStateHouseholdFAPayment.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully update Direct Deposit payment group status', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'Cancelled');
          financialAssistanceDetailsPage.getPaymentLineItemAmountField().should('have.attr', 'class').and('contains', 'line-through');
          financialAssistanceDetailsPage.getPaymentGroupListField().contains('Payment total: $0.00');

          updatePaymentGroupStatusTo({
            paymentStatus: 'Completed',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Cancelled',
            paymentModality: 'direct deposit',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Inprogress',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Cancelled',
            paymentModality: 'direct deposit',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'New',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Inprogress',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Completed',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Inprogress',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'New',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'Completed',
          });

          updatePaymentGroupStatusTo({
            paymentStatus: 'New',
          });
        });
      });
    }
  });
  describe('Cannot roles', () => {
    before(() => {
      cy.then(async function () {
        // eslint-disable-next-line
        const resultPrepareStateHouseholdFAPayment = await prepareStateHouseholdAddSubmitUpdateFAPayment(accessTokenL6, this.event, this.table.id, PaymentStatus.Cancelled, EPaymentModalities.DirectDeposit);
        cy.wrap(resultPrepareStateHouseholdFAPayment.caseFile.id).as('caseFileId');
        cy.wrap(resultPrepareStateHouseholdFAPayment.submittedFinancialAssistancePayment.id).as('FAPaymentId');
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleValue);
          cy.goTo(`casefile/${this.caseFileId}/financialAssistance`);
        });
        it('should not be able to update Direct Deposit payment group status', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPaymentLineStatusElement().click();
          financialAssistanceDetailsPage.getPaymentLineStatusIssued().should('not.exist');
        });
      });
    }
  });
});
