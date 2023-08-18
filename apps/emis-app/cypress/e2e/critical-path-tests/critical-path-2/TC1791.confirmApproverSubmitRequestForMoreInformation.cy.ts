import { UserRoles } from '@libs/cypress-lib/support/msal';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { format } from 'date-fns';
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

describe('#TC1791# - Confirm that an Approver can submit a request for more information', { tags: ['@approval', '@financial-assistance'] }, () => {
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
            cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('CaseFileId');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleValue);
            cy.goTo('approvals/request');
          });
        });
        it('should successfully submit a request for more information', function () {
          const approvalsPage = new ApprovalsPage();

          approvalsPage.getPendingRequestsTable().contains(`${this.FAPaymentName}`).should('be.visible');
          approvalsPage.getActionsButtonByPaymentId(this.FAPaymentId);
          approvalsPage.getDialogTitle().contains('Action approval').should('be.visible');
          approvalsPage.checkApprovalActionRequestInfo();
          // eslint-disable-next-line
          approvalsPage.getLabelConfirmedCheckboxField().contains('I confirm that I have informed the requestor that this requires additional information prior to approval.').should('be.visible');
          approvalsPage.checkConfirmedCheckbox();
          approvalsPage.enterApprovalActionRationale().type('Please upload the results of the beneficiary assessment');
          approvalsPage.submitActionApproval();
          cy.contains('Approval status has been updated').should('be.visible');

          const financialAssistanceDetailsPage = approvalsPage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getApprovalHistory();
          cy.contains(`${this.FAPaymentName}`).should('be.visible');
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(0).should('eq', `Payment submitted to  ${getUserName(roleName)}`);
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(0).should('eq', 'Submitted');
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(1).should('eq', 'Please upload the results of the beneficiary assessment');
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(1).should('eq', 'Request additional information');
          financialAssistanceDetailsPage.closeDialogApprovalStatusHistory();

          const caseFileDetailsPage = financialAssistanceDetailsPage.closeConfirmationMessageAndGoToCaseFileDetailsPage();
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityLogDate().should('eq', format(Date.now(), 'yyyy-MM-dd'));
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Financial assistance payment - Request additional information');
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
        it('should not be able to submit a request for more information', () => {
          const approvalsPage = new ApprovalsPage();

          cy.contains('You do not have permission to access this page').should('be.visible');
          approvalsPage.getPendingRequestsTable().should('not.exist');
        });
      });
    }
  });
});
