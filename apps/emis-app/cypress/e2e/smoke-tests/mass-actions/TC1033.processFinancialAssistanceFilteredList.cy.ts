import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { IEventEntity } from '@libs/entities-lib/event';
import { EFinancialAmountModes, IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IProgramEntity } from '@libs/entities-lib/program';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import { createEventAndTeam, createProgramWithTableWithItemAndSubItem, prepareStateHouseholdMassFinancialAssistance } from '../../helpers/prepareState';
import { MassFinancialAssistanceDetailsPage } from '../../../pages/mass-action/mass-financial-assistance/massFinancialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../../../pages/casefiles/caseFileDetails.page';

const canRoles = [
  UserRoles.level6,
];

const cannotRoles = [
  UserRoles.level5,
  UserRoles.level4,
  UserRoles.level3,
  UserRoles.level2,
  UserRoles.level1,
  UserRoles.level0,
  UserRoles.contributor1,
  UserRoles.contributor2,
  UserRoles.contributor3,
  UserRoles.readonly,
];

const { filteredCanRoles, filteredCannotRoles, allRoles } = getRoles(canRoles, cannotRoles);

let event = null as IEventEntity;
let accessTokenL6 = '';
let table = null as IFinancialAssistanceTableEntity;
let program = null as IProgramEntity;
let casefileId = '';
let massFinancialAssistanceName = '';

// There is a chance for this test to be flaky because of indexes and search. If that's the case, it's better to use test it with a CSV instead of filtered list
describe(
  '#TC1033# - Process a Financial Assistance filtered list',
  {
    tags: ['@financial-assistance', '@mass-actions'],
    retries: {
      openMode: 2,
      runMode: 3,
    },
  },
() => {
  describe('Can Roles', () => {
    for (const roleName of filteredCanRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.getToken().then(async (tokenResponse) => {
            accessTokenL6 = tokenResponse.access_token;
            const resultPrepareStateEvent = await createEventAndTeam(accessTokenL6, allRoles);
            const { provider, team } = resultPrepareStateEvent;
            event = resultPrepareStateEvent.event;
            const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, event.id, EFinancialAmountModes.Fixed);
            table = resultCreateProgram.table;
            program = resultCreateProgram.program;
            const resultMassFinancialAssistance = await prepareStateHouseholdMassFinancialAssistance(accessTokenL6, event, table.id, program.id);
            massFinancialAssistanceName = resultMassFinancialAssistance.responseMassFinancialAssistance.name;
            casefileId = resultMassFinancialAssistance.responseCreateHousehold.registrationResponse.caseFile.id;
            cy.login(roleName);
            cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
            cy.wrap(provider).as('provider');
            cy.wrap(team).as('teamCreated');
          });
        });
        afterEach(function () {
          if (this.teamCreated?.id && this.provider) {
            removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
          }
        });
        it('should successfully process a financial assistance filtered list', () => {
          const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
          cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
          massFinancialAssistanceDetailsPage.getDialogSubmitButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogCancelButton().should('be.visible');
          massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
          massFinancialAssistanceDetailsPage.confirmProcessing();
          cy.waitForMassActionToBe(MassActionRunStatus.Processed);
          massFinancialAssistanceDetailsPage.getNumberFailedRecords().then((quantity) => {
            if (quantity === '0') {
              massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
            }
          cy.goTo(`casefile/${casefileId}`);

          const caseFileDetailsPage = new CaseFileDetailsPage();
          caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
          caseFileDetailsPage.getCaseFileActivityBodies().should('string', massFinancialAssistanceName).and('string', '$80.00');
          caseFileDetailsPage.goToFinancialAssistanceHomePage();

          const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // initialising to avoid dependency cycle
          financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
          financialAssistanceHomePage.getFAPaymentName().should('eq', massFinancialAssistanceName);
          financialAssistanceHomePage.getFAPaymentCreatedDate().should('eq', getToday());
          financialAssistanceHomePage.getFAPaymentAmount().should('eq', '$80.00');
          financialAssistanceHomePage.getApprovalStatus().should('eq', 'Approved');
          financialAssistanceHomePage.expandFAPayment();
          financialAssistanceHomePage.getFAPaymentGroupTitle().should('string', 'Cheque');
          financialAssistanceHomePage.getFAPaymentGroupTotal().should('eq', '$80.00');
          financialAssistanceHomePage.getFAPaymentPaymentStatus().should('eq', 'Status: New');

          const financialAssistanceDetailsPage = financialAssistanceHomePage.getFAPayment();
          financialAssistanceDetailsPage.getPaymentLineStatus().should('eq', 'New');
          financialAssistanceDetailsPage.getPaymentAmount().should('string', '$80.00');
          financialAssistanceDetailsPage.getPaymentModalityGroup().should('string', 'Clothing > Winter Clothing');
          });
        });
      });
    }
  });
  describe('Cannot Roles', () => {
     for (const roleName of filteredCannotRoles) {
      describe(`${roleName}`, () => {
        beforeEach(() => {
          cy.login(roleName);
          cy.goTo('mass-actions/financial-assistance');
        });
        it('should not be able to process a financial assistance filtered list', () => {
          cy.contains('You do not have permission to access this page').should('be.visible');
        });
      });
    }
  });
},
);
