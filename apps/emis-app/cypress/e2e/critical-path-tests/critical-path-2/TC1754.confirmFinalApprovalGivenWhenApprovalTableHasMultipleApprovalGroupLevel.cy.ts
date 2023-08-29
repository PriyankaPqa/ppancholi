import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { formatCurrentDate } from '@libs/cypress-lib/helpers';
import { format } from 'date-fns';
import {
  addFinancialAssistancePayment,
  createApprovalTableWithMultipleApprovalGroup,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  escalateFinancialAssistancePaymentToNextLevelApprover,
  prepareStateHousehold,
  submitFinancialAssistancePaymentToApprover } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ApprovalsPage } from '../../../pages/approvals/approvals.cy';

const canRoles = {
  Level4: UserRoles.level4,
};

const cannotRoles = {
  Level6: UserRoles.level6,
  Level5: UserRoles.level5,
  Level3: UserRoles.level3,
  Level2: UserRoles.level2,
  Level1: UserRoles.level1,
  Level0: UserRoles.level0,
  Contributor1: UserRoles.contributor1,
  Contributor3: UserRoles.contributor3,
  ReadOnly: UserRoles.readonly,
};

const allRolesValues = [...Object.values(canRoles), ...Object.values(cannotRoles)];

let accessTokenL6 = '';

// eslint-disable-next-line
describe('#TC1754# - 2nd Approval Group - Confirm that FINAL approval can be given when Approval table has more than one Approval Group level', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRolesValues);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);
      const resultFATable = await createFATable(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id, EFinancialAmountModes.Fixed);
      await createApprovalTableWithMultipleApprovalGroup(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id);
      cy.wrap(resultPrepareStateEvent.provider).as('provider');
      cy.wrap(resultPrepareStateEvent.event).as('event');
      cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
      cy.wrap(resultFATable.id).as('faTableId');
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
            const resultFAPayment = await addFinancialAssistancePayment(resultHousehold.provider, EPaymentModalities.Voucher, resultHousehold.registrationResponse.caseFile.id, this.faTableId);
            await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId('Level3'));
            await escalateFinancialAssistancePaymentToNextLevelApprover(resultFAPayment.id, getUserId(roleName), UserRoles.level3);
            cy.wrap(resultFAPayment.id).as('FAPaymentId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.caseFileNumber).as('CaseFileNumber');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleValue);
            cy.goTo('approvals/request');
          });
        });
        // eslint-disable-next-line
        it('should successfully give final approval', function () {
          const approvalsPage = new ApprovalsPage();

          approvalsPage.searchPendingApprovalRequestsUsingCaseFileNumber(this.CaseFileNumber);
          approvalsPage.getPendingRequestsTable().contains(this.event.name.translation.en).should('be.visible');
          approvalsPage.getSubmittedByUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName('Level3')); // initially Level6 user submits fa payment request to Level3 user
          approvalsPage.getSubmittedToUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName(roleName));
          approvalsPage.getDateSubmittedUsingPaymentId(this.FAPaymentId).should('eq', formatCurrentDate());
          approvalsPage.getActionsButtonByPaymentId(this.FAPaymentId).should('be.visible').click();
          approvalsPage.getDialogTitle().contains('Action approval').should('be.visible');
          approvalsPage.checkApprovalActionRequestApproved();
          approvalsPage.enterApprovalActionRationale().type('I am approving this amount');
          approvalsPage.submitActionApproval();
          cy.contains('Approval status has been updated').should('be.visible');
          approvalsPage.getActionIconElementUsingPaymentId(this.FAPaymentId).should('have.attr', 'class').and('contains', 'check theme');
          approvalsPage.getApprovedRequestsTab();

          const financialAssistanceDetailsPage = approvalsPage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Approved');
          financialAssistanceDetailsPage.getApprovalHistory();
          cy.contains(`${this.FAPaymentName}`).should('be.visible');
          financialAssistanceDetailsPage.getApprovalHistoryCRCPersonnelByIndex(0).should('eq', 'TestDev6(System Admin)');
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(0).should('eq', `Payment submitted to  ${getUserName('Level3')}`);
          financialAssistanceDetailsPage.getApprovalHistoryDateSubmittedByIndex(0).should('eq', formatCurrentDate());
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(0).should('eq', 'Submitted');
          financialAssistanceDetailsPage.getApprovalHistoryCRCPersonnelByIndex(1).should('eq', `${getUserName('Level3')}(${getUserRoleDescription('Level3')})`);
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(1).should('eq', 'sending this for next level approval');
          financialAssistanceDetailsPage.getApprovalHistoryDateSubmittedByIndex(1).should('eq', formatCurrentDate());
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(1).should('eq', 'Approved');
          financialAssistanceDetailsPage.getApprovalHistoryCRCPersonnelByIndex(2).should('eq', `${getUserName(roleName)}(${getUserRoleDescription(roleName)})`);
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(2).should('eq', 'I am approving this amount');
          financialAssistanceDetailsPage.getApprovalHistoryDateSubmittedByIndex(2).should('eq', formatCurrentDate());
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(2).should('eq', 'Approved - Final');
          financialAssistanceDetailsPage.closeDialogApprovalStatusHistory();

          const caseFileDetailsPage = financialAssistanceDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', `Name: ${this.FAPaymentName}`).and('string', 'Amount: $80.00');
        });
      });
    }
  });
  describe('Cannot Roles', () => {
    before(() => {
      cy.then(async function () {
        const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);
        // eslint-disable-next-line
        const resultFAPayment = await addFinancialAssistancePayment(resultHousehold.provider, EPaymentModalities.Voucher, resultHousehold.registrationResponse.caseFile.id, this.faTableId);
        await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId('Level3'));
        await escalateFinancialAssistancePaymentToNextLevelApprover(resultFAPayment.id, getUserId('Level4'), UserRoles.level3);
        cy.wrap(resultFAPayment.id).as('FAPaymentId');
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
        it('should not be able to give final approval', function () {
          const approvalsPage = new ApprovalsPage();

          if (roleName === 'Level3') {
            cy.waitUntilTableFullyLoaded('approval-requests-pending');
            approvalsPage.getFAPaymentElementById(this.FAPaymentId).should('not.exist'); // verify that submitted payment is not present for approver group 1 (Level 3)
          } else {
            cy.contains('You do not have permission to access this page').should('be.visible');
            approvalsPage.getPendingRequestsTable().should('not.exist');
          }
        });
      });
    }
  });
});
