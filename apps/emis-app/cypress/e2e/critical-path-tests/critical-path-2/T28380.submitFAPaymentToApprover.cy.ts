import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { getToday } from '@libs/cypress-lib/helpers';
import {
  AddFinancialAssistancePaymentParams,
  CreateFATableParams,
  addFinancialAssistancePayment,
  createApprovalTable,
  createCustomProgram,
  createEventAndTeam,
  createFATable,
  prepareStateHousehold,
} from '../../helpers/prepareState';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';

const canRoles = [
  UserRoles.level6,
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
];

const cannotRoles = [
  UserRoles.level0,
  UserRoles.contributor3,
  UserRoles.contributor2,
  UserRoles.contributor1,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let accessTokenL6 = '';

describe('[T28380] Submit FA payment to an Approver.', { tags: ['@approval', '@financial-assistance'] }, () => {
  before(() => {
    cy.getToken().then(async (tokenResponse) => {
      accessTokenL6 = tokenResponse.access_token;
      const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, [...allRoles, UserRoles.level3, UserRoles.level4]);
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
            cy.wrap(resultFAPayment.id).as('FAPaymentId');
            cy.wrap(resultFAPayment.name).as('FAPaymentName');
            cy.login(roleName);
            cy.goTo(`casefile/${resultHousehold.registrationResponse.caseFile.id}/financialAssistance`);
          });
        });
        // eslint-disable-next-line
        it('should successfully submit FA payment to an Approver', function () {
          const financialAssistanceHomePage = new FinancialAssistanceHomePage();
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
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
          financialAssistanceDetailsPage.refreshUntilApproverGroupVisible();
          financialAssistanceDetailsPage.selectFirstAvailableSupervisor();
          financialAssistanceDetailsPage.getDialogSubmitButton().click();
          cy.contains('The financial assistance has been successfully submitted for approval').should('be.visible');
          financialAssistanceDetailsPage.getFinancialAssistanceApprovalStatus().should('eq', 'Pending');
          financialAssistanceDetailsPage.goToFinancialAssistanceHomePage();

          financialAssistanceHomePage.getFAPaymentNameById(this.FAPaymentId).should('eq', this.FAPaymentName);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithStatus(this.FAPaymentId, 'Pending');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Pending');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('eq', 'Voucher');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const caseFileDetailsPage = financialAssistanceHomePage.goToCaseFileDetailsPage();
          caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(`Name: ${this.FAPaymentName}`);
          caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
          caseFileDetailsPage.getRoleName().should('eq', `(${getUserRoleDescription(roleName)})`);
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Submitted');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', `Name: ${this.FAPaymentName}`).and('string', 'Amount: $80.00');
        });
      });
    }
    describe('Cannot roles', () => {
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
          cy.wrap(resultHousehold.registrationResponse.caseFile.id).as('casefileId');
          cy.wrap(resultFAPayment.id).as('FAPaymentId');
        });
      });
       for (const roleName of filteredCannotRoles) {
        describe(`${roleName}`, () => {
          beforeEach(function () {
            cy.login(roleName);
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
