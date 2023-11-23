import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { AddSubmitUpdateFaPaymentParams, prepareStateEventTeamProgramTableWithItemSubItem, prepareStateHouseholdAddSubmitUpdateFAPayment } from '../../helpers/prepareState';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { updatePaymentGroupStatusTo } from './canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.contributor2,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor3,
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('#TC266# - Update Direct Deposit payment group status - L6 and C2', { tags: ['@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEventTeamProgramTable = await prepareStateEventTeamProgramTableWithItemSubItem(accessTokenL6, allRoles, EFinancialAmountModes.Fixed);
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
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const addSubmitUpdateFaPaymentParamData: AddSubmitUpdateFaPaymentParams = {
              accessTokenL6,
              event: this.event,
              tableId: this.table.id,
              paymentStatus: PaymentStatus.Cancelled,
              paymentModalities: EPaymentModalities.DirectDeposit,
            };
            const resultPrepareStateHouseholdFAPayment = await prepareStateHouseholdAddSubmitUpdateFAPayment(addSubmitUpdateFaPaymentParamData);
            cy.wrap(resultPrepareStateHouseholdFAPayment.submittedFinancialAssistancePayment.id).as('FAPaymentId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultPrepareStateHouseholdFAPayment.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully update Direct Deposit payment group status', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$0.00');
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
        const addSubmitUpdateFaPaymentParamData: AddSubmitUpdateFaPaymentParams = {
          accessTokenL6,
          event: this.event,
          tableId: this.table.id,
          paymentStatus: PaymentStatus.Cancelled,
          paymentModalities: EPaymentModalities.DirectDeposit,
        };
        const resultPrepareStateHouseholdFAPayment = await prepareStateHouseholdAddSubmitUpdateFAPayment(addSubmitUpdateFaPaymentParamData);
        cy.wrap(resultPrepareStateHouseholdFAPayment.caseFile.id).as('caseFileId');
        cy.wrap(resultPrepareStateHouseholdFAPayment.submittedFinancialAssistancePayment.id).as('FAPaymentId');
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(function () {
          cy.login(roleName);
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
