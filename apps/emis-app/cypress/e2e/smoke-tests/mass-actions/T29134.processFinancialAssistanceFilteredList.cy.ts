import { UserRoles } from '@libs/cypress-lib/support/msal';
import { getRoles } from '@libs/cypress-lib/helpers/rolesSelector';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { getToday } from '@libs/cypress-lib/helpers';
import { getUserName } from '@libs/cypress-lib/helpers/users';
import { FinancialAssistanceHomePage } from '../../../pages/financial-assistance-payment/financialAssistanceHome.page';
import { removeTeamMembersFromTeam } from '../../helpers/teams';
import {
  CreateMassFinancialAssistanceFilteredListParams,
  createEventAndTeam,
  createProgramWithTableWithItemAndSubItem,
  prepareStateHouseholdMassFinancialAssistance,
} from '../../helpers/prepareState';
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

let accessTokenL6 = '';

// There is a chance for this test to be flaky because of indexes and search. If that's the case, it's better to use test it with a CSV instead of filtered list
describe(
  '[T29134] Process a Financial Assistance filtered list.',
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
              const resultCreateProgram = await createProgramWithTableWithItemAndSubItem(provider, resultPrepareStateEvent.event.id, EFinancialAmountModes.Fixed);

              const completeAndSubmitCasefileAssessmentParamData: CreateMassFinancialAssistanceFilteredListParams = {
                accessToken: accessTokenL6,
                event: resultPrepareStateEvent.event,
                tableId: resultCreateProgram.table.id,
                programId: resultCreateProgram.program.id,
              };
              const resultMassFinancialAssistance = await prepareStateHouseholdMassFinancialAssistance(completeAndSubmitCasefileAssessmentParamData);
              cy.wrap(provider).as('provider');
              cy.wrap(team).as('teamCreated');
              cy.wrap(resultPrepareStateEvent.event).as('event');
              cy.wrap(resultCreateProgram.table).as('faTable');
              cy.wrap(resultCreateProgram.program.name.translation.en).as('programName');
              cy.wrap(resultMassFinancialAssistance.responseMassFinancialAssistance.name).as('massFinancialAssistanceName');
              cy.wrap(resultMassFinancialAssistance.responseCreateHousehold.registrationResponse.caseFile.id).as('casefileId');
              cy.login(roleName);
              cy.goTo(`mass-actions/financial-assistance/details/${resultMassFinancialAssistance.responseMassFinancialAssistance.id}`);
            });
          });
          afterEach(function () {
            if (this.teamCreated?.id && this.provider) {
              removeTeamMembersFromTeam(this.teamCreated.id, this.provider);
            }
          });
          // eslint-disable-next-line
          it('should successfully process a financial assistance filtered list', function () {
            const massFinancialAssistanceDetailsPage = new MassFinancialAssistanceDetailsPage();
            cy.waitForMassActionToBe(MassActionRunStatus.PreProcessed);
            massFinancialAssistanceDetailsPage.getMassActionProcessButton().should('be.visible');
            massFinancialAssistanceDetailsPage.getMassActionProcessButton().click();
            massFinancialAssistanceDetailsPage.getDialogConfirmSubmitButton().should('be.visible');
            massFinancialAssistanceDetailsPage.getDialogConfirmCancelButton().should('be.visible');
            massFinancialAssistanceDetailsPage.getDialogText().should('eq', 'Are you sure you want to start processing this mass action?');
            massFinancialAssistanceDetailsPage.confirmProcessing();
            massFinancialAssistanceDetailsPage.getPreProcessingLabelOne().should('eq', 'Please wait while the case files are being processed.');
            massFinancialAssistanceDetailsPage.getPreProcessingLabelTwo().should('eq', 'This might take a few minutes depending on the number of processed case files.');
            cy.waitForMassActionToBe(MassActionRunStatus.Processed);
            massFinancialAssistanceDetailsPage.getMassActionStatus().contains('Processed').should('be.visible');
            massFinancialAssistanceDetailsPage.getMassActionType().should('eq', 'Financial assistance');
            massFinancialAssistanceDetailsPage.getMassActionDateCreated().should('eq', getToday());
            massFinancialAssistanceDetailsPage.verifyAndGetMassActionCreatedBy(getUserName(roleName)).should('eq', getUserName(roleName));
            massFinancialAssistanceDetailsPage.getNumberFailedRecords().then((quantity) => {
              if (quantity === '0') {
                massFinancialAssistanceDetailsPage.getInvalidCasefilesDownloadButton().should('be.disabled');
              }
            });
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsEvent().should('eq', this.event.name.translation.en);
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsTable().should('eq', this.faTable.name.translation.en);
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsProgram().should('eq', this.programName);
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsItem().should('eq', 'Clothing');
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsSubItem().should('eq', 'Winter Clothing');
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentModality().should('eq', 'cheque');
            massFinancialAssistanceDetailsPage.getMassActionPaymentDetailsPaymentAmount().should('eq', '$80.00');
            massFinancialAssistanceDetailsPage.getBackToMassActionListButton().should('be.visible');

            cy.goTo(`casefile/${this.casefileId}`);

            const caseFileDetailsPage = new CaseFileDetailsPage();
            caseFileDetailsPage.getCaseFileActivityTitles().should('string', 'Financial assistance payment - Approved - Final');
            caseFileDetailsPage.getCaseFileActivityBodies().should('string', this.massFinancialAssistanceName).and('string', '$80.00');
            caseFileDetailsPage.goToFinancialAssistanceHomePage();

            const financialAssistanceHomePage = new FinancialAssistanceHomePage(); // initialising to avoid dependency cycle
            financialAssistanceHomePage.refreshUntilFaPaymentDisplayedWithTotal('$80.00');
            financialAssistanceHomePage.getFAPaymentName().should('eq', this.massFinancialAssistanceName);
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
