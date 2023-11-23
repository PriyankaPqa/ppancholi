import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import {
  AddFinancialAssistancePaymentParams,
  CreateFATableParams,
  addFinancialAssistancePayment,
  createApprovalTable,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  prepareStateHousehold,
  submitFinancialAssistancePaymentToApprover } from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ApprovalsPage } from '../../../pages/approvals/approvals.cy';

const canRoles = [
  UserRoles.level4,
  UserRoles.level3,
];

const cannotRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('#TC1792# - Confirm that an Approver can decline a payment request', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);

      const createFaTableParamData: CreateFATableParams = {
        provider: resultPrepareStateEvent.provider,
        eventId: resultPrepareStateEvent.event.id,
        programId: resultProgram.id,
        amountType: EFinancialAmountModes.Fixed,
      };
      const resultFATable = await createFATable(createFaTableParamData);
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
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(async function () {
            const resultHousehold = await prepareStateHousehold(accessTokenL6, this.event);

            const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
              provider: resultHousehold.provider,
              modality: EPaymentModalities.Voucher,
              caseFileId: resultHousehold.registrationResponse.caseFile.id,
              financialAssistanceTableId: this.tableId,
            };
            const resultFAPayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
            await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId(roleName));
            cy.wrap(resultFAPayment.id).as('FAPaymentId');
            cy.wrap(resultHousehold.registrationResponse.caseFile.caseFileNumber).as('CaseFileNumber');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleName);
            cy.goTo('approvals/request');
          });
        });
        it('should successfully decline a payment request by approver', function () {
          const approvalsPage = new ApprovalsPage();

          approvalsPage.searchApprovalTableFor(this.CaseFileNumber, this.FAPaymentId);
          approvalsPage.getPendingRequestsTable().contains(`${this.FAPaymentName}`).should('be.visible');
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

        const addFinancialAssistancePaymentParamData: AddFinancialAssistancePaymentParams = {
          provider: resultHousehold.provider,
          modality: EPaymentModalities.Voucher,
          caseFileId: resultHousehold.registrationResponse.caseFile.id,
          financialAssistanceTableId: this.tableId,
        };
        const resultFAPayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
        await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId('level4'));
      });
    });
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.then(() => {
            cy.login(roleName);
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
