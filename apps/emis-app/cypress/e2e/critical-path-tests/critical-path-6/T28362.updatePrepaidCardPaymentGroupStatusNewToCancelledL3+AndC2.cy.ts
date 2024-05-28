import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { AddSubmitUpdateFaPaymentParams, prepareStateEventTeamProgramTableWithItemSubItem, prepareStateHouseholdAddSubmitUpdateFAPayment } from '../../helpers/prepareState';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { updatePaymentGroupStatusTo } from '../critical-path-1/canSteps';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.contributor2,
];

const cannotRoles = [
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor3,
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28362] Update Prepaid card payment group status from New to Cancelled- L3+ and C2.', { tags: ['@financial-assistance'] }, () => {
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
              paymentStatus: PaymentStatus.New,
              paymentModalities: EPaymentModalities.PrepaidCard,
            };
            const resultPrepareStateHouseholdFAPayment = await prepareStateHouseholdAddSubmitUpdateFAPayment(addSubmitUpdateFaPaymentParamData);
            cy.wrap(resultPrepareStateHouseholdFAPayment.submittedFinancialAssistancePayment.id).as('FAPaymentId');
            cy.login(roleName);
            cy.goTo(`casefile/${resultPrepareStateHouseholdFAPayment.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully update Prepaid card payment group status from New to Cancelled', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'New');
          updatePaymentGroupStatusTo({
            paymentStatus: 'Cancelled',
            paymentModality: 'prepaid card',
            roleName,
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
          paymentStatus: PaymentStatus.New,
          paymentModalities: EPaymentModalities.PrepaidCard,
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
        it('should not be able to update Prepaid card payment group status', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPaymentLineStatusElement().click();
          financialAssistanceDetailsPage.getPaymentLineStatusIssued().should('not.exist');
        });
      });
    }
  });
});
