import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import {
  addFinancialAssistancePayment,
  createApprovalTable,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  prepareStateHousehold,
  submitFinancialAssistancePaymentToApprover } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ApprovalsPage } from '../../../pages/approvals/approvals.cy';

const canRoles = {
  Level4: UserRoles.level4,
  Level3: UserRoles.level3,
};

const cannotRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';

describe('#TC1792# - Confirm that an Approver can decline a payment request', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);
      const resultFATable = await createFATable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id, EFinancialAmountModes.Fixed);
      await createApprovalTable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id);
      cy.wrap(resultPrepareStateEvent.provider).as('provider');
      cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
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
            await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId(roleName));
            cy.wrap(resultFAPayment.id).as('FAPaymentId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.caseFileNumber).as('CaseFileNumber');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleValue);
            cy.goTo('approvals/request');
          });
        });
        it('should successfully decline a payment request by approver', function () {
          const approvalsPage = new ApprovalsPage();

          approvalsPage.getPendingRequestsTable().contains(`${this.FAPaymentName}`).should('be.visible');
          approvalsPage.searchApprovalTableFor(this.CaseFileNumber, this.FAPaymentId);
          approvalsPage.clickActionsButtonByPaymentId(this.FAPaymentId);
          approvalsPage.getDialogTitle().contains('Action approval').should('be.visible');
          approvalsPage.checkApprovalActionDecline();
          approvalsPage.getLabelConfirmedCheckboxField().contains('I confirm that I have informed the requestor that the approval has been declined.').should('be.visible');
          approvalsPage.checkConfirmedCheckbox();
          approvalsPage.enterApprovalActionRationale().type('you did not provide the information that I previously needed in order to approve it');
          approvalsPage.submitActionApproval();
          cy.contains('Approval status has been updated').should('be.visible');

          const financialAssistanceDetailsPage = approvalsPage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPageTitleElement().contains('Financial assistance details').should('be.visible');
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Declined');
          financialAssistanceDetailsPage.getApprovalHistory();
          cy.contains(`${this.FAPaymentName}`).should('be.visible');
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(0).should('eq', `Payment submitted to  ${getUserName(roleName)}`);
           // eslint-disable-next-line
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(0).should('string', 'Submitted to').and('string', `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`);
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(1).should('eq', 'you did not provide the information that I previously needed in order to approve it');
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(1).should('eq', 'Declined');
          financialAssistanceDetailsPage.closeDialogApprovalStatusHistory();

          const caseFileDetailsPage = financialAssistanceDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Name: ${this.FAPaymentName}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Financial assistance payment - Declined');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', `Name: ${this.FAPaymentName}`).and('string', 'Amount: $0.00');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
        // eslint-disable-next-line
        const resultFAPayment = await addFinancialAssistancePayment(resultHousehold.provider, EPaymentModalities.Voucher, resultHousehold.registrationResponse.caseFile.id, this.tableId);
        await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId('Level4'));
      });
    });
    for (const [roleName, roleValue] of Object.entries(cannotRoles)) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(() => {
            cy.login(roleValue);
            cy.goTo('approvals/request');
          });
        });
        it('should not be able to decline a payment request by approver', () => {
          const approvalsPage = new ApprovalsPage();

          cy.contains('You do not have permission to access this page').should('be.visible');
          approvalsPage.getPendingRequestsTable().should('not.exist');
        });
      });
    }
  });
});
