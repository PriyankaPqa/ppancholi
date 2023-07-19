import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { format } from 'date-fns';
import {
  addFinancialAssistancePayment,
  createApprovalTable,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  prepareStateHousehold } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

const canRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
};

const cannotRoles = {
  Level0: UserRoles.level0,
  Contributor3: UserRoles.contributor3,
  Contributor2: UserRoles.contributor2,
  Contributor1: UserRoles.contributor1,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';

describe('#TC1743# - Submit FA payment to an Approver', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);
      const resultFATable = await createFATable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id, EFinancialAmountModes.Fixed);
      await createApprovalTable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id);
      cy.wrap(resultPrepareStateEvent.event).as('event');
      cy.wrap(resultFATable.id).as('tableId');
    });
  });
  after(function () {
    if (this.provider && this.teamCreated?.id) {
      removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
    }
  });

  describe('Can Roles', () => {
    for (const [roleName, roleValue] of Object.entries(canRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
            // eslint-disable-next-line
            const resultFAPayment = await addFinancialAssistancePayment(resultHousehold.provider, EPaymentModalities.Voucher, resultHousehold.registrationResponse.caseFile.id, this.tableId);
            cy.wrap(resultFAPayment.id).as('FAPaymentId');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleValue);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/financialAssistance`);
          });
        });
        it('should successfully submit FA payment to an Approver', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'New');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getAddPaymentLineButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
          financialAssistanceDetailsPage.getSubmitAssistanceButton().click();
          cy.contains(`${this.FAPaymentName}`).should('be.visible');
          financialAssistanceDetailsPage.getDialogSelectSupervisorDropdown().should('be.visible');
          financialAssistanceDetailsPage.getDialogSelectSupervisorDropdown().should('have.attr', 'label').and('contains', 'Select supervisor to submit for approval');
          financialAssistanceDetailsPage.getDialogSubmitButton().should('be.enabled');
          financialAssistanceDetailsPage.getDialogCancelButton().should('be.enabled');
          financialAssistanceDetailsPage.selectFirstAvailableSupervisor();
          financialAssistanceDetailsPage.getDialogSubmitButton().click();
          cy.contains('The financial assistance has been successfully submitted for approval').should('be.visible');
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Pending');
          financialAssistanceDetailsPage.goToFinancialAssistanceHomePage();

          financialAssistanceHomePage.getFAPaymentNameById(this.FAPaymentId).should('eq', this.FAPaymentName);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Pending');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('eq', 'Voucher');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const caseFileDetailsPage = financialAssistanceHomePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Submitted');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Name: ${this.FAPaymentName}`).and('string', 'Amount: $80.00');
        });
      });
    }
    describe('Cannot roles', () => {
      before(() => {
        cy.then(async function () {
          const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
          // eslint-disable-next-line
          const resultFAPayment = await addFinancialAssistancePayment(resultHousehold.provider, EPaymentModalities.Voucher, resultHousehold.registrationResponse.caseFile.id, this.tableId);
          cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
          cy.wrap(resultFAPayment.id).as('FAPaymentId');
        });
      });
      for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
        describe(`${roleName}`, () => {
          beforeEach(function () {
            cy.login(roleValue);
            cy.goTo(`casefile/${this.casefileId}/financialAssistance`);
          });
          it('should not be able to submit FA payment to an Approver', function () {
            const financialAssistanceHomePage = new FinancialAssistanceHomePage();

            const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPaymentById(this.FAPaymentId);
            financialAssistanceDetailsPage.getBackToFinancialAssistanceButton().should('be.enabled');
            financialAssistanceDetailsPage.getSubmitAssistanceButton().should('not.exist');
          });
        });
      }
    });
  });
});
