import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserId, getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { getToday } from '@libs/cypress-lib/helpers';
import {
  AddFinancialAssistancePaymentParams,
  CreateFATableParams,
  addFinancialAssistancePayment,
  createApprovalTableWithMultipleApprovalGroup,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  prepareStateHousehold,
  submitFinancialAssistancePaymentToApprover,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { ApprovalsPage } from '../../../pages/approvals/approvals.cy';

const canRoles = [
  UserRoles.level3,
];

const cannotRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

// eslint-disable-next-line
describe('[T28118] 1st Approval Group - Confirm that payment can be escalated to next level approver when Approval table has more than one Approval Group level', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, [...canRoles, ...cannotRoles]);
      const resultProgram = await createCustomProgram(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, true);

      const createFaTableParamData: CreateFATableParams = {
        provider: resultPrepareStateEvent.provider,
        eventId: resultPrepareStateEvent.event.id,
        programId: resultProgram.id,
        amountType: EFinancialAmountModes.Fixed,
      };
      const resultFATable = await createFATable(createFaTableParamData);
      await createApprovalTableWithMultipleApprovalGroup(resultPrepareStateEvent.provider, resultPrepareStateEvent.event.id, resultProgram.id);
      cy.wrap(resultPrepareStateEvent.provider).as('provider');
      cy.wrap(resultPrepareStateEvent.team).as('teamCreated');
      cy.wrap(resultPrepareStateEvent.event).as('event');
      cy.wrap(resultFATable.id).as('faTableId');
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
              financialAssistanceTableId: this.faTableId,
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
        // eslint-disable-next-line
        it('should successfully escalate payment to next level approver', function () {
          const approvalsPage = new ApprovalsPage();

          approvalsPage.searchApprovalTableFor(this.CaseFileNumber, this.FAPaymentId);
          approvalsPage.getPendingRequestsTable().contains(this.event.name.translation.en).should('be.visible');
          approvalsPage.getSubmittedByUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName('level6')); // initially Level6 user submits fa payment request to Level3 user
          approvalsPage.getSubmittedToUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName(roleName));
          approvalsPage.getDateSubmittedUsingPaymentId(this.FAPaymentId).should('eq', getToday());
          approvalsPage.getActionsButtonByPaymentId(this.FAPaymentId).should('be.visible').click();
          approvalsPage.getDialogTitle().contains('Action approval').should('be.visible');
          approvalsPage.checkApprovalActionRequestApproved();
          approvalsPage.refreshUntilApproverSupervisorVisible(this.FAPaymentId);
          approvalsPage.selectSupervisorForApproval(getUserName('level4')); // Level3 user belonging to Approver Group 1 submits approval request to Level4 of Approver Group 2
          approvalsPage.enterApprovalActionRationale().type('sending this for next level approval');
          approvalsPage.submitActionApproval();
          cy.contains('Approval status has been updated').should('be.visible');
          approvalsPage.getSubmittedByUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName(roleName));
          approvalsPage.getSubmittedToUserNameUsingPaymentId(this.FAPaymentId).should('eq', getUserName('level4'));
          approvalsPage.getActionIconElementUsingPaymentId(this.FAPaymentId).should('have.attr', 'class').and('contains', 'check theme'); // verify if checkmark icon is visible instead of Actions button

          const financialAssistanceDetailsPage = approvalsPage.getFAPaymentById(this.FAPaymentId);
          financialAssistanceDetailsPage.getPageTitleElement().contains('Financial assistance details').should('be.visible');
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Pending');
          financialAssistanceDetailsPage.getApprovalHistory();
          cy.contains(`${this.FAPaymentName}`).should('be.visible');
          financialAssistanceDetailsPage.getApprovalHistoryCRCPersonnelByIndex(0).should('eq', 'TestDev6(System Admin)');
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(0).should('eq', `Payment submitted to  ${getUserName(roleName)}`);
          financialAssistanceDetailsPage.getApprovalHistoryDateSubmittedByIndex(0).should('eq', getToday());
          // eslint-disable-next-line
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(0).should('string', 'Submitted to').and('string', `${getUserName(roleName)} (${getUserRoleDescription(roleName)})`);
          financialAssistanceDetailsPage.getApprovalHistoryCRCPersonnelByIndex(1).should('eq', `${getUserName(roleName)}(${getUserRoleDescription(roleName)})`);
          financialAssistanceDetailsPage.getApprovalHistoryRationaleByIndex(1).should('eq', 'sending this for next level approval');
          financialAssistanceDetailsPage.getApprovalHistoryDateSubmittedByIndex(1).should('eq', getToday());
          // eslint-disable-next-line
          financialAssistanceDetailsPage.getApprovalHistoryActionByIndex(1).should('string', 'Approved and submitted to').and('string', `${getUserName('level4')} (${getUserRoleDescription('level4')})`);
          financialAssistanceDetailsPage.closeDialogApprovalStatusHistory();

          const caseFileDetailsPage = financialAssistanceDetailsPage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Name: ${this.FAPaymentName}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Financial assistance payment - Approved');
          caseFileDetailsPage.getCaseFileActivityBody().should('string', `Name: ${this.FAPaymentName}`).and('string', 'Amount: $80.00');
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
          financialAssistanceTableId: this.faTableId,
        };
        const resultFAPayment = await addFinancialAssistancePayment(addFinancialAssistancePaymentParamData);
        await submitFinancialAssistancePaymentToApprover(resultHousehold.provider, resultFAPayment.id, getUserId('level3'));
        cy.wrap(resultFAPayment.id).as('FAPaymentId');
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
        it('should not be able to escalate payment to next level approver', function () {
          const approvalsPage = new ApprovalsPage();

          if (roleName === UserRoles.level4) {
            cy.waitUntilTableFullyLoaded('approval-requests-pending');
            approvalsPage.getFAPaymentElementById(this.FAPaymentId).should('not.exist'); // verify that submitted payment is not present for approver group 2 (Level 4)
          } else {
            cy.contains('You do not have permission to access this page').should('be.visible');
            approvalsPage.getPendingRequestsTable().should('not.exist');
          }
        });
      });
    }
  });
});
